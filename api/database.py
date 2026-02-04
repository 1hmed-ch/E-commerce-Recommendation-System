"""
MongoDB Database Connection and Operations
"""
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection

from .config import MONGODB_URI, MONGODB_DATABASE


class MongoDBConnection:
    """MongoDB connection manager."""
    
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.is_connected = False
    
    def connect(self, uri: str = MONGODB_URI, database: str = MONGODB_DATABASE) -> bool:
        """Connect to MongoDB."""
        try:
            print(f"Connecting to MongoDB: {database}...")
            self.client = MongoClient(uri)
            self.db = self.client[database]
            
            # Test connection
            self.client.admin.command('ping')
            self.is_connected = True
            print("✅ MongoDB connected successfully!")
            return True
        except Exception as e:
            print(f"❌ MongoDB connection failed: {e}")
            self.is_connected = False
            return False
    
    def disconnect(self):
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            self.is_connected = False
            print("MongoDB disconnected.")
    
    @property
    def products(self) -> Collection:
        """Get the products collection."""
        if self.db is None:
            raise ConnectionError("Not connected to MongoDB")
        return self.db["products"]
    
    def insert_products(self, products: List[Dict[str, Any]]) -> int:
        """Insert multiple products into the database."""
        if not products:
            return 0
        result = self.products.insert_many(products)
        return len(result.inserted_ids)
    
    def get_all_products(self) -> List[Dict[str, Any]]:
        """Get all products from the database."""
        return list(self.products.find({}, {"_id": 0}))
    
    def get_product_count(self) -> int:
        """Get total number of products."""
        return self.products.count_documents({})
    
    def clear_products(self):
        """Clear all products from the collection."""
        result = self.products.delete_many({})
        return result.deleted_count
    
    def get_categories(self) -> List[str]:
        """Get unique categories."""
        return sorted(self.products.distinct("super_category"))
    
    def get_stats(self) -> Dict[str, Any]:
        """Get aggregate statistics."""
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total_products": {"$sum": 1},
                    "avg_price": {"$avg": "$price"},
                    "avg_rating": {"$avg": "$stars"},
                    "categories": {"$addToSet": "$super_category"}
                }
            }
        ]
        result = list(self.products.aggregate(pipeline))
        if result:
            data = result[0]
            return {
                "total_products": data["total_products"],
                "categories": len(data["categories"]),
                "avg_price": round(data["avg_price"], 2) if data["avg_price"] else 0,
                "avg_rating": round(data["avg_rating"], 2) if data["avg_rating"] else 0
            }
        return {"total_products": 0, "categories": 0, "avg_price": 0, "avg_rating": 0}


# Singleton instance
mongodb = MongoDBConnection()
