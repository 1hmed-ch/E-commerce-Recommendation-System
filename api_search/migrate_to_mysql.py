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

PICKLE_PATH = Path(__file__).parent.parent / "optimized_search_engine.pkl"

# SQL to create table - matches ecomrecom.sql schema exactly
CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS products (
    id BIGINT NOT NULL AUTO_INCREMENT,
    available BIT(1) NOT NULL DEFAULT 1,
    brand VARCHAR(255) DEFAULT NULL,
    category VARCHAR(255) DEFAULT NULL,
    created_at DATETIME(6) NOT NULL,
    description VARCHAR(2000) DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    cluster_id INT DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 100,
    updated_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_category (category),
    INDEX idx_price (price),
    INDEX idx_cluster (cluster_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
            connection_timeout=300,
            autocommit=False,
            buffered=True,
            use_pure=True
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


def migrate_data(conn, df, batch_size=1000):
    """Insert product data into MySQL in batches."""
    cursor = conn.cursor()
    
    # Create table
    print("Creating products table...")
    cursor.execute("SET FOREIGN_KEY_CHECKS=0")
    cursor.execute("DROP TABLE IF EXISTS products")
    cursor.execute(CREATE_TABLE_SQL)
    cursor.execute("SET FOREIGN_KEY_CHECKS=1")
    conn.commit()
    
    # Prepare insert statement - map pickle columns to ecomrecom.sql schema
    columns = ['name', 'price', 'category', 'image_url', 'cluster_id', 
               'available', 'stock_quantity', 'created_at', 'updated_at',
               'brand', 'description']
    
    placeholders = ', '.join(['%s'] * len(columns))
    columns_str = ', '.join(columns)
    
    insert_sql = f"""
    INSERT INTO products ({columns_str}) 
    VALUES ({placeholders})
    """
    
    total = len(df)
    inserted = 0
    errors = 0
    
    print(f"Inserting {total:,} products in batches of {batch_size}...")
    
    from datetime import datetime
    now = datetime.now()
    
    for i in range(0, total, batch_size):
        batch = df.iloc[i:i+batch_size]
        batch_data = []
        
        for _, row in batch.iterrows():
            try:
                # Map pickle columns to SQL schema
                name = row.get('title') or row.get('clean_title') or 'Unknown Product'
                price = row.get('price') or 0.0
                category = row.get('super_category') or row.get('categoryName')
                image_url = row.get('imgUrl')
                cluster_id = row.get('cluster_id')
                available = 1  # Default: all products available
                stock_quantity = 100  # Default stock
                created_at = now
                updated_at = now
                brand = None  # Not in pickle data
                description = row.get('semantic_text') or row.get('clean_title')
                
                # Clean and validate values
                if isinstance(price, float) and np.isnan(price):
                    price = 0.0
                if isinstance(cluster_id, (np.integer, np.int64)):
                    cluster_id = int(cluster_id)
                elif isinstance(cluster_id, float) and np.isnan(cluster_id):
                    cluster_id = None
                    
                # Truncate description to 2000 chars
                if description and len(str(description)) > 2000:
                    description = str(description)[:1997] + '...'
                
                # Truncate name to 255 chars
                if name and len(str(name)) > 255:
                    name = str(name)[:252] + '...'
                
                values = (name, price, category, image_url, cluster_id,
                         available, stock_quantity, created_at, updated_at,
                         brand, description)
                batch_data.append(values)
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
    
    cursor.execute("SELECT COUNT(DISTINCT category) FROM products")
    categories = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(price) FROM products")
    result = cursor.fetchone()
    
    cursor.close()
    
    print(f"\nDatabase Stats:")
    print(f"   - Total products: {count:,}")
    print(f"   - Categories: {categories}")
    print(f"   - Avg price: ${result[0]:.2f}")


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
        # Migrate data with smaller batch size for reliability
        migrate_data(conn, df, batch_size=1000)
        
        # Verify
        verify_migration(conn)
        
    finally:
        conn.close()
        print("\nMySQL connection closed.")


if __name__ == "__main__":
    main()
