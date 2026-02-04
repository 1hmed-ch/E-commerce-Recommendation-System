"""
Recommendation Engine - Core logic for product recommendations
Uses MongoDB for product data and in-memory TF-IDF for similarity search
"""
import re
import joblib
import numpy as np
import pandas as pd
from typing import Optional, List
from fastapi import HTTPException
from nltk.stem import PorterStemmer

from .models import Product, SearchResponse, StatsResponse, SearchResultItem, SearchResponseSlim
from .database import mongodb
from .config import MODEL_PATH


class RecommendationEngine:
    """Handles all recommendation logic with MongoDB backend."""
    
    def __init__(self):
        self.stemmer = PorterStemmer()
        self.vectorizer = None
        self.search_model = None
        self.tfidf_matrix = None
        self.product_ids = None  # List of ASINs for index mapping
        self.is_loaded = False
        self.use_mongodb = False
    
    def load(self, pkl_path: str = MODEL_PATH) -> bool:
        """Load the TF-IDF model and connect to MongoDB."""
        try:
            # 1. Connect to MongoDB
            print("Connecting to MongoDB...")
            if mongodb.connect():
                product_count = mongodb.get_product_count()
                if product_count > 0:
                    self.use_mongodb = True
                    print(f"✅ MongoDB connected with {product_count:,} products")
                else:
                    print("⚠️  MongoDB connected but empty - will use pickle file")
            else:
                print("⚠️  MongoDB not available - will use pickle file")
            
            # 2. Load TF-IDF components from pickle
            print(f"Loading TF-IDF model from: {pkl_path}")
            engine_data = joblib.load(pkl_path)
            
            self.vectorizer = engine_data.get('vectorizer')
            self.search_model = engine_data.get('search_model')
            self.tfidf_matrix = engine_data.get('embeddings')
            
            # Get product IDs for index mapping
            df = engine_data.get('data')
            if df is not None:
                self.product_ids = df['asin'].tolist()
            
            if self.vectorizer is None or self.search_model is None:
                print("❌ Missing vectorizer or search_model in pickle")
                return False
            
            self.is_loaded = True
            print("✅ Recommendation engine loaded successfully!")
            print(f"   - Using MongoDB: {self.use_mongodb}")
            print(f"   - TF-IDF features: {self.tfidf_matrix.shape[1]:,}")
            print(f"   - Products indexed: {len(self.product_ids):,}")
            return True
            
        except Exception as e:
            print(f"❌ Error loading engine: {e}")
            return False
    
    def clean_query(self, query: str) -> str:
        """Clean user query the same way as training data."""
        query = str(query).lower()
        query = re.sub(r'[^a-z0-9\s]', '', query)
        query = " ".join([self.stemmer.stem(word) for word in query.split()])
        return query
    
    def get_recommendations(
        self, 
        query: str, 
        top_k: int = 10, 
        min_price: Optional[float] = None,
        max_price: Optional[float] = None, 
        category: Optional[str] = None,
        category_name: Optional[str] = None,
        min_stars: Optional[float] = None,
        min_reviews: Optional[int] = None,
        sort_by: str = "relevance"
    ) -> SearchResponse:
        """Get product recommendations based on the query with filters."""
        
        if not self.is_loaded:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")
        
        try:
            # Clean and vectorize query
            clean_q = self.clean_query(query)
            query_vec = self.vectorizer.transform([clean_q])
            
            # Get nearest neighbors (fetch more for filtering)
            n_neighbors = min(500, self.tfidf_matrix.shape[0])
            distances, indices = self.search_model.kneighbors(query_vec, n_neighbors=n_neighbors)
            
            # Get ASINs of matching products
            matching_asins = [self.product_ids[i] for i in indices[0]]
            similarity_scores = {asin: (1 - dist) * 100 for asin, dist in zip(matching_asins, distances[0])}
            
            # Build filters dict
            filters = {
                "min_price": min_price,
                "max_price": max_price,
                "category": category,
                "category_name": category_name,
                "min_stars": min_stars,
                "min_reviews": min_reviews
            }
            
            # Fetch products from MongoDB
            if self.use_mongodb:
                products_data = self._fetch_from_mongodb(matching_asins, filters)
            else:
                products_data = self._fetch_from_memory(indices[0], filters)
            
            if not products_data:
                return SearchResponse(products=[], count=0, query=query)
            
            # Add similarity scores
            for p in products_data:
                p['similarity'] = similarity_scores.get(p.get('asin', ''), 0)
            
            # Rank and sort products
            products_data = self._rank_and_sort(products_data, sort_by)[:top_k]
            
            # Convert to Product models
            products = [
                Product(
                    title=str(p.get('title', 'N/A'))[:100],
                    price=float(p.get('price', 0)),
                    stars=float(p.get('stars', 0)),
                    reviews=int(p.get('reviews', 0)),
                    category=str(p.get('super_category', 'N/A')),
                    similarity=round(p.get('similarity', 0), 2),
                    final_score=round(p.get('final_score', 0), 2),
                    image=str(p.get('imgUrl', ''))
                )
                for p in products_data
            ]
            
            return SearchResponse(products=products, count=len(products), query=query)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_recommendations_slim(
        self, 
        query: str, 
        top_k: int = 10, 
        min_price: Optional[float] = None,
        max_price: Optional[float] = None, 
        category: Optional[str] = None,
        category_name: Optional[str] = None,
        min_stars: Optional[float] = None,
        min_reviews: Optional[int] = None,
        sort_by: str = "relevance"
    ) -> SearchResponseSlim:
        """Get product ASIN IDs based on the query (lightweight - no full product fetch)."""
        
        if not self.is_loaded:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")
        
        try:
            # Clean and vectorize query
            clean_q = self.clean_query(query)
            query_vec = self.vectorizer.transform([clean_q])
            
            # Get nearest neighbors
            n_neighbors = min(top_k * 5, self.tfidf_matrix.shape[0])  # Fetch more for potential filtering
            distances, indices = self.search_model.kneighbors(query_vec, n_neighbors=n_neighbors)
            
            # Build results with ASINs and similarity scores
            results = []
            for idx, dist in zip(indices[0], distances[0]):
                asin = self.product_ids[idx]
                similarity = (1 - dist) * 100
                # For slim response, final_score equals similarity (no ranking factors)
                results.append(SearchResultItem(
                    asin=asin,
                    similarity=round(similarity, 2),
                    final_score=round(similarity, 2)
                ))
            
            # Limit to top_k results
            results = results[:top_k]
            
            return SearchResponseSlim(results=results, count=len(results), query=query)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def _fetch_from_mongodb(self, asins: List[str], filters: dict) -> List[dict]:
        """Fetch products from MongoDB with filters."""
        query = {"asin": {"$in": asins}}
        
        # Price filters
        if filters.get("min_price") and filters["min_price"] > 0:
            query.setdefault("price", {})["$gte"] = filters["min_price"]
        if filters.get("max_price") and filters["max_price"] > 0:
            query.setdefault("price", {})["$lte"] = filters["max_price"]
        
        # Category filters
        if filters.get("category") and filters["category"] != 'All Categories':
            query["super_category"] = filters["category"]
        if filters.get("category_name"):
            query["categoryName"] = {"$regex": filters["category_name"], "$options": "i"}
        
        # Rating/Review filters
        if filters.get("min_stars") and filters["min_stars"] > 0:
            query["stars"] = {"$gte": filters["min_stars"]}
        if filters.get("min_reviews") and filters["min_reviews"] > 0:
            query["reviews"] = {"$gte": filters["min_reviews"]}
        
        products = list(mongodb.products.find(query, {"_id": 0}))
        
        # Maintain order from similarity search
        asin_order = {asin: i for i, asin in enumerate(asins)}
        products.sort(key=lambda p: asin_order.get(p.get('asin', ''), 999999))
        
        return products
    
    def _fetch_from_memory(self, indices: np.ndarray, filters: dict) -> List[dict]:
        """Fallback: fetch from in-memory dataframe (loaded from pickle)."""
        # This would require keeping the dataframe in memory as fallback
        # For now, return empty if MongoDB is not available
        return []
    
    def _rank_and_sort(self, products: List[dict], sort_by: str = "relevance") -> List[dict]:
        """Apply ranking and sorting based on user preference."""
        if not products:
            return products
        
        df = pd.DataFrame(products)
        
        # Calculate hybrid score for relevance ranking
        df['star_score'] = df['stars'].rank(pct=True) if 'stars' in df.columns else 0.5
        df['review_score'] = np.log1p(df['reviews']).rank(pct=True) if 'reviews' in df.columns else 0.5
        df['final_score'] = (
            df['similarity'] * 0.70 +
            df['star_score'] * 20 +
            df['review_score'] * 10
        )
        
        # Apply sorting
        if sort_by == "price_low":
            df = df.sort_values('price', ascending=True)
        elif sort_by == "price_high":
            df = df.sort_values('price', ascending=False)
        elif sort_by == "rating":
            df = df.sort_values('stars', ascending=False)
        elif sort_by == "reviews":
            df = df.sort_values('reviews', ascending=False)
        else:  # "relevance" (default)
            df = df.sort_values('final_score', ascending=False)
        
        return df.to_dict('records')
    
    def get_categories(self) -> List[str]:
        """Get list of available categories."""
        if self.use_mongodb:
            return mongodb.get_categories()
        return []
    
    def get_stats(self) -> StatsResponse:
        """Get engine statistics."""
        if not self.is_loaded:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")
        
        if self.use_mongodb:
            stats = mongodb.get_stats()
            return StatsResponse(
                total_products=stats['total_products'],
                categories=stats['categories'],
                avg_price=stats['avg_price'],
                avg_rating=stats['avg_rating']
            )
        
        raise HTTPException(status_code=500, detail="No data available")


# Singleton instance
engine = RecommendationEngine()
