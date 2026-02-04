"""
Migrate product data from pickle file to MySQL database
Run this once to populate the database with product data
"""
import os
import sys
import joblib
import numpy as np
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import mysql.connector
from mysql.connector import Error

# Configuration
MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", 3306))
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "ecomrecom")

PICKLE_PATH = Path(__file__).parent.parent / "recommendation_engine_tf_idf.pkl"

# SQL to create table
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asin VARCHAR(50) UNIQUE NOT NULL,
    title TEXT,
    imgUrl TEXT,
    stars DECIMAL(3, 2),
    reviews INT,
    price DECIMAL(10, 2),
    categoryName VARCHAR(255),
    isBestSeller BOOLEAN DEFAULT FALSE,
    super_category VARCHAR(255),
    price_log DECIMAL(10, 4),
    review_log DECIMAL(10, 4),
    clean_title TEXT,
    semantic_text TEXT,
    cluster_id INT,
    INDEX idx_asin (asin),
    INDEX idx_category (super_category),
    INDEX idx_price (price),
    INDEX idx_stars (stars),
    INDEX idx_cluster (cluster_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


def connect_to_mysql():
    """Connect to MySQL database with pool settings for large operations."""
    try:
        print(f"Connecting to MySQL: {MYSQL_HOST}:{MYSQL_PORT}...")
        
        # First connect without database to create it if needed
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            connection_timeout=30
        )
        
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE}")
        cursor.close()
        conn.close()
        
        # Now connect to the database with settings for large operations
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            database=MYSQL_DATABASE,
            connection_timeout=60,
            autocommit=False,
            buffered=True
        )
        print(f"[OK] Connected to MySQL database: {MYSQL_DATABASE}")
        return conn
    except Error as e:
        print(f"[ERROR] MySQL connection failed: {e}")
        return None


def load_pickle_data():
    """Load product data from pickle file."""
    print(f"Loading data from: {PICKLE_PATH}")
    engine_data = joblib.load(PICKLE_PATH)
    df = engine_data.get('data')
    
    if df is None:
        print("[ERROR] No data found in pickle file")
        return None
    
    print(f"[OK] Loaded {len(df):,} products from pickle")
    return df


def migrate_data(conn, df, batch_size=5000):
    """Insert product data into MySQL in batches."""
    cursor = conn.cursor()
    
    # Create table
    print("Creating products table...")
    cursor.execute(CREATE_TABLE_SQL)
    conn.commit()
    
    # Prepare insert statement
    columns = ['asin', 'title', 'imgUrl', 'stars', 'reviews', 'price', 
               'categoryName', 'isBestSeller', 'super_category', 
               'price_log', 'review_log', 'clean_title', 'semantic_text', 'cluster_id']
    
    placeholders = ', '.join(['%s'] * len(columns))
    columns_str = ', '.join(columns)
    
    insert_sql = f"""
    INSERT INTO products ({columns_str}) 
    VALUES ({placeholders})
    ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        imgUrl = VALUES(imgUrl),
        stars = VALUES(stars),
        reviews = VALUES(reviews),
        price = VALUES(price),
        categoryName = VALUES(categoryName),
        isBestSeller = VALUES(isBestSeller),
        super_category = VALUES(super_category),
        price_log = VALUES(price_log),
        review_log = VALUES(review_log),
        clean_title = VALUES(clean_title),
        semantic_text = VALUES(semantic_text),
        cluster_id = VALUES(cluster_id)
    """
    
    total = len(df)
    inserted = 0
    errors = 0
    
    print(f"Inserting {total:,} products in batches of {batch_size}...")
    
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        batch_data = []
        
        for _, row in batch.iterrows():
            try:
                # Clean and prepare values
                values = []
                for col in columns:
                    val = row.get(col)
                    # Handle NaN values
                    if isinstance(val, float) and np.isnan(val):
                        val = None
                    # Convert numpy types to Python types
                    elif isinstance(val, (np.integer, np.int64)):
                        val = int(val)
                    elif isinstance(val, (np.floating, np.float64)):
                        val = float(val)
                    elif isinstance(val, np.bool_):
                        val = bool(val)
                    values.append(val)
                batch_data.append(tuple(values))
            except Exception as e:
                errors += 1
                continue
        
        try:
            cursor.executemany(insert_sql, batch_data)
            conn.commit()
            inserted += len(batch_data)
            pct = (inserted / total) * 100
            print(f"   Progress: {inserted:,}/{total:,} ({pct:.1f}%)")
        except Error as e:
            print(f"   Batch error: {e}")
            errors += len(batch_data)
            conn.rollback()
    
    cursor.close()
    print(f"\n[OK] Migration complete!")
    print(f"   - Inserted: {inserted:,}")
    print(f"   - Errors: {errors:,}")
    
    return inserted


def verify_migration(conn):
    """Verify the migration was successful."""
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM products")
    count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(DISTINCT super_category) FROM products")
    categories = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(price), AVG(stars) FROM products")
    result = cursor.fetchone()
    
    cursor.close()
    
    print(f"\nDatabase Stats:")
    print(f"   - Total products: {count:,}")
    print(f"   - Categories: {categories}")
    print(f"   - Avg price: ${result[0]:.2f}")
    print(f"   - Avg rating: {result[1]:.2f} stars")


def main():
    print("=" * 50)
    print("   Product Data Migration (Pickle → MySQL)")
    print("=" * 50)
    
    # Load pickle data
    df = load_pickle_data()
    if df is None:
        return
    
    # Connect to MySQL
    conn = connect_to_mysql()
    if conn is None:
        return
    
    try:
        # Migrate data
        migrate_data(conn, df)
        
        # Verify
        verify_migration(conn)
        
    finally:
        conn.close()
        print("\nMySQL connection closed.")


if __name__ == "__main__":
    main()
