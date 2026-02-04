"""
Migration Script: Load products from pickle file into MongoDB
Run this once to populate the database.

Usage: python migrate_to_mongodb.py
"""
import os
import sys
import joblib
from tqdm import tqdm

# Add api folder to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.database import mongodb
from api.config import MODEL_PATH


def migrate_products():
    """Load products from pickle and insert into MongoDB."""
    
    print("=" * 60)
    print("   MIGRATION: Pickle → MongoDB")
    print("=" * 60)
    
    # 1. Connect to MongoDB
    if not mongodb.connect():
        print("Failed to connect to MongoDB. Make sure MongoDB is running.")
        print("Start MongoDB with: mongod")
        return False
    
    # 2. Load pickle file
    print(f"\nLoading data from: {MODEL_PATH}")
    try:
        engine_data = joblib.load(MODEL_PATH)
        df = engine_data.get('data')
        
        if df is None:
            print("❌ No 'data' key found in pickle file")
            return False
        
        print(f"✅ Loaded {len(df):,} products from pickle file")
    except Exception as e:
        print(f"❌ Error loading pickle: {e}")
        return False
    
    # 3. Check existing data
    existing_count = mongodb.get_product_count()
    if existing_count > 0:
        print(f"\n⚠️  Database already has {existing_count:,} products.")
        response = input("Clear existing data and reload? (y/n): ").strip().lower()
        if response == 'y':
            deleted = mongodb.clear_products()
            print(f"   Deleted {deleted:,} existing products.")
        else:
            print("Migration cancelled.")
            return False
    
    # 4. Prepare products for MongoDB
    print("\nPreparing products for MongoDB...")
    
    # Select columns to store
    columns_to_keep = [
        'asin', 'title', 'price', 'stars', 'reviews', 
        'categoryName', 'super_category', 'imgUrl',
        'clean_title', 'semantic_text'
    ]
    
    # Keep only existing columns
    columns_to_keep = [c for c in columns_to_keep if c in df.columns]
    df_subset = df[columns_to_keep].copy()
    
    # Convert to list of dicts
    products = df_subset.to_dict('records')
    
    # 5. Insert in batches
    batch_size = 5000
    total_inserted = 0
    
    print(f"\nInserting {len(products):,} products in batches of {batch_size}...")
    
    for i in tqdm(range(0, len(products), batch_size), desc="Migrating"):
        batch = products[i:i + batch_size]
        inserted = mongodb.insert_products(batch)
        total_inserted += inserted
    
    # 6. Verify
    final_count = mongodb.get_product_count()
    print(f"\n✅ Migration complete!")
    print(f"   Products in database: {final_count:,}")
    
    # 7. Show stats
    stats = mongodb.get_stats()
    print(f"\n   Database Statistics:")
    print(f"   - Total Products: {stats['total_products']:,}")
    print(f"   - Categories: {stats['categories']}")
    print(f"   - Avg Price: ${stats['avg_price']:.2f}")
    print(f"   - Avg Rating: {stats['avg_rating']:.1f} stars")
    
    # 8. Create indexes for faster queries
    print("\nCreating indexes...")
    mongodb.products.create_index("asin", unique=True)
    mongodb.products.create_index("super_category")
    mongodb.products.create_index("price")
    mongodb.products.create_index("stars")
    print("✅ Indexes created!")
    
    mongodb.disconnect()
    return True


if __name__ == "__main__":
    success = migrate_products()
    sys.exit(0 if success else 1)
