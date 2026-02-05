"""
MySQL Database Connection for Product Search
All product data is stored in and queried from MySQL
"""
from typing import Optional, List, Dict, Any
from contextlib import contextmanager
import numpy as np

import mysql.connector
from mysql.connector import Error as MySQLError

from .config import MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE


class MySQLDatabase:
    """MySQL database connection manager for product operations."""
    
    # Product columns to fetch - matches ecomrecom.sql schema
    PRODUCT_COLUMNS = [
        'id', 'name', 'price', 'brand', 'category', 'description',
        'image_url', 'stock_quantity', 'available', 'cluster_id',
        'created_at', 'updated_at'
    ]
    
    def __init__(self):
        self.connection = None
        self.is_connected = False
    
    def connect(self) -> bool:
        """Connect to MySQL database."""
        try:
            print(f"Connecting to MySQL: {MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}...")
            self.connection = mysql.connector.connect(
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PASSWORD,
                database=MYSQL_DATABASE
            )
            
            # Test connection
            cursor = self.connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            
            self.is_connected = True
            print(f"[OK] MySQL connected to {MYSQL_DATABASE}")
            return True
            
        except MySQLError as e:
            print(f"[ERROR] MySQL connection failed: {e}")
            self.is_connected = False
            return False
    
    def disconnect(self):
        """Disconnect from database."""
        if self.connection:
            self.connection.close()
            self.is_connected = False
            print("MySQL disconnected.")
    
    @contextmanager
    def get_cursor(self, dictionary: bool = True):
        """Context manager for database cursor."""
        cursor = self.connection.cursor(dictionary=dictionary)
        try:
            yield cursor
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            raise e
        finally:
            cursor.close()
    
    def get_product_count(self) -> int:
        """Get total number of products."""
        with self.get_cursor(dictionary=False) as cursor:
            cursor.execute("SELECT COUNT(*) FROM products")
            result = cursor.fetchone()
            return result[0] if result else 0
    
    def get_product_by_id(self, product_id: int) -> Optional[Dict[str, Any]]:
        """Get a single product by its ID."""
        cols = ', '.join(self.PRODUCT_COLUMNS)
        
        with self.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT {cols}
                FROM products 
                WHERE id = %s
            """, (product_id,))
            return cursor.fetchone()
    
    def get_all_products(self, limit: int = 500) -> List[Dict[str, Any]]:
        """Get all products (with limit)."""
        cols = ', '.join(self.PRODUCT_COLUMNS)
        
        with self.get_cursor() as cursor:
            cursor.execute(f"SELECT {cols} FROM products LIMIT %s", (limit,))
            return cursor.fetchall()
    
    def get_products_by_asins(self, asins: List[str]) -> List[Dict[str, Any]]:
        """Get multiple products by their ASINs."""
        if not asins:
            return []
        
        cols = ', '.join(self.PRODUCT_COLUMNS)
        placeholders = ', '.join(['%s'] * len(asins))
        
        with self.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT {cols}
                FROM products 
                WHERE asin IN ({placeholders})
            """, tuple(asins))
            return cursor.fetchall()
    
    def get_products_by_indices(self, indices: List[int]) -> List[Dict[str, Any]]:
        """Get products by their row indices (1-indexed IDs in DB)."""
        if not indices:
            return []
        
        # Convert 0-indexed to 1-indexed IDs
        ids = [int(i) + 1 for i in indices]
        cols = ', '.join(self.PRODUCT_COLUMNS)
        placeholders = ', '.join(['%s'] * len(ids))
        
        with self.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT {cols}
                FROM products 
                WHERE id IN ({placeholders})
            """, tuple(ids))
            return cursor.fetchall()
    
    def get_trending_products(self, top_n: int = 10) -> List[Dict[str, Any]]:
        """Get trending products (high price * stock as popularity proxy)."""
        cols = ', '.join(self.PRODUCT_COLUMNS)
        
        with self.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT {cols},
                       (price * LN(stock_quantity + 1)) as trending_score
                FROM products 
                WHERE price IS NOT NULL AND stock_quantity IS NOT NULL
                ORDER BY trending_score DESC
                LIMIT %s
            """, (top_n,))
            return cursor.fetchall()
    
    def search_products_with_filters(
        self,
        asins: List[str],
        min_price: float = None,
        max_price: float = None,
        category: str = None
    ) -> List[Dict[str, Any]]:
        """Get products by name similarity with optional filters (no ASIN in new schema)."""
        if not asins:
            # If no ASINs provided, just use filters
            return self.get_all_products(50)
        
        # Since we don't have ASIN anymore, we'll need to match by name
        # For now, just apply filters to all products (simplified)
        cols = ', '.join(self.PRODUCT_COLUMNS)
        
        # Build WHERE clause
        where_parts = []
        params = []
        
        if min_price is not None:
            where_parts.append("price >= %s")
            params.append(min_price)
        if max_price is not None:
            where_parts.append("price <= %s")
            params.append(max_price)
        if category:
            where_parts.append("category = %s")
            params.append(category)
        
        where_clause = " AND ".join(where_parts) if where_parts else "1=1"
        
        with self.get_cursor() as cursor:
            cursor.execute(f"""
                SELECT {cols}
                FROM products 
                WHERE {where_clause}
                LIMIT 100
            """, tuple(params))
            return cursor.fetchall()
    
    def get_categories(self) -> List[str]:
        """Get unique categories."""
        with self.get_cursor() as cursor:
            cursor.execute("""
                SELECT DISTINCT category
                FROM products 
                WHERE category IS NOT NULL
                ORDER BY category
            """)
            return [row['category'] for row in cursor.fetchall()]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get aggregate statistics."""
        with self.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_products,
                    AVG(price) as avg_price,
                    COUNT(DISTINCT category) as categories
                FROM products
            """)
            result = cursor.fetchone()
            
            if result:
                return {
                    "total_products": result['total_products'] or 0,
                    "avg_price": round(result['avg_price'], 2) if result['avg_price'] else 0,
                    "categories": result['categories'] or 0
                }
            return {"total_products": 0, "categories": 0, "avg_price": 0}
    
    def get_all_products_dataframe(self):
        """Get all products as a pandas-compatible list of dicts (for indexing)."""
        cols = ', '.join(self.PRODUCT_COLUMNS)
        
        with self.get_cursor() as cursor:
            cursor.execute(f"SELECT {cols} FROM products")
            return cursor.fetchall()


# Singleton instance
db = MySQLDatabase()
