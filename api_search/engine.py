"""
Search Engine with TF-IDF and MySQL Backend
All product data is fetched from MySQL database
TF-IDF model and indices are loaded from pickle file
"""
import re
import joblib
import numpy as np
import pandas as pd
from typing import Optional, List, Dict, Any
from nltk.stem import PorterStemmer

from .config import MODEL_PATH
from .database import db


class SearchEngine:
    """Search engine with TF-IDF matching and MySQL product data."""
    
    def __init__(self):
        self.stemmer = PorterStemmer()
        self.tfidf = None
        self.search_model = None
        self.kmeans = None
        self.product_asins = None  # List of ASINs for index mapping
        self.is_loaded = False
    
    def load(self, pkl_path: str = MODEL_PATH) -> bool:
        """Load the TF-IDF model and connect to MySQL database."""
        try:
            # 1. MUST connect to MySQL (required for data)
            if not db.connect():
                print("[ERROR] Failed to connect to MySQL - required for product data")
                return False
            
            # Verify products exist in database
            product_count = db.get_product_count()
            if product_count == 0:
                print("[ERROR] No products in database. Run migrate_to_mysql.py first!")
                return False
            
            print(f"[OK] MySQL connected with {product_count:,} products")
            
            # 2. Load TF-IDF components from pickle
            print(f"Loading search model from: {pkl_path}")
            engine_data = joblib.load(pkl_path)
            
            self.tfidf = engine_data.get('vectorizer')
            self.search_model = engine_data.get('search_model')
            self.kmeans = engine_data.get('kmeans') or engine_data.get('kmeans_model')
            
            # Get ASIN mapping from pickle (for index lookup)
            df = engine_data.get('data')
            if df is not None:
                self.product_asins = df['asin'].tolist()
                print(f"   - TF-IDF indexed: {len(self.product_asins):,} products")
            else:
                print("[ERROR] No ASIN mapping in pickle file")
                return False
            
            if self.tfidf is None or self.search_model is None:
                print("[ERROR] Missing vectorizer or search_model in pickle")
                return False
            
            self.is_loaded = True
            print("[OK] Search engine loaded successfully!")
            return True
            
        except Exception as e:
            print(f"[ERROR] Error loading engine: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def clean_text(self, text: str) -> str:
        """Clean and stem text for search."""
        text = str(text).lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        text = " ".join([self.stemmer.stem(word) for word in text.split()])
        return text
    
    def get_trending_products(self, n: int = 5, reason: str = "Trending Fallback") -> List[Dict]:
        """Returns the store's bestsellers from MySQL."""
        products = db.get_trending_products(n)
        
        # Add search metadata
        for p in products:
            p['similarity'] = 0.0
            p['final_score'] = p.get('trending_score', 0)
            p['match_type'] = reason
        
        return products
    
    def search(
        self,
        query: str,
        top_k: int = 10,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        category: Optional[str] = None
    ) -> List[Dict]:
        """
        TF-IDF search (simplified for new schema without ASIN).
        Uses product names for matching.
        """
        
        # --- STAGE 1: INPUT VALIDATION ---
        if not query:
            return self.get_trending_products(top_k, reason="Empty Query")
        
        clean_q = self.clean_text(query)
        query_vec = self.tfidf.transform([clean_q])
        
        # CHECK A: Out-of-Vocabulary (OOV)
        if query_vec.sum() == 0:
            print(f"[WARN] Unknown words in query: '{query}'. Switching to Trending.")
            return self.get_trending_products(top_k, reason="Unknown Words")
        
        # --- STAGE 2: TF-IDF RETRIEVAL ---
        n_neighbors = min(500, len(self.product_asins)) if self.product_asins else 100
        distances, indices = self.search_model.kneighbors(query_vec, n_neighbors=n_neighbors)
        
        # Get similarity scores for matched indices
        similarity_scores = {}
        matched_ids = []
        for idx, dist in zip(indices[0], distances[0]):
            similarity = (1 - dist) * 100
            if similarity > 5.0:  # Filter threshold
                # Map pickle index to product ID (1-indexed in DB)
                product_id = int(idx) + 1
                similarity_scores[product_id] = similarity
                matched_ids.append(product_id)
        
        if not matched_ids:
            return self.get_trending_products(top_k, reason="Low Relevance")
        
        # --- STAGE 3: FETCH FROM MySQL ---
        products = db.get_products_by_indices(indices[0].tolist())
        
        # Apply filters manually (since we're ID-based now)
        filtered_products = []
        for p in products:
            if min_price is not None and (p.get('price') or 0) < min_price:
                continue
            if max_price is not None and (p.get('price') or 0) > max_price:
                continue
            if category and p.get('category') != category:
                continue
            filtered_products.append(p)
        
        if not filtered_products:
            return self.get_trending_products(top_k, reason="No matches after filters")
        
        # --- STAGE 4: SCORING ---
        scored_products = []
        for p in filtered_products:
            product_id = p.get('id')
            similarity = similarity_scores.get(product_id, 0)
            
            p['similarity'] = round(similarity, 2)
            p['final_score'] = similarity  # Simplified scoring
            p['match_type'] = "Direct Search"
            scored_products.append(p)
        
        # Sort by similarity
        scored_products.sort(key=lambda x: x['similarity'], reverse=True)
        return scored_products[:top_k]
    
    def search_ids(
        self,
        query: str,
        top_k: int = 10,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        category: Optional[str] = None
    ) -> List[int]:
        """
        Search for products and return only their IDs.
        Uses the same logic as search() but returns a list of product IDs.
        
        Args:
            query: Search query
            top_k: Number of results to return
            min_price: Minimum price filter
            max_price: Maximum price filter
            category: Category filter
            
        Returns:
            List of product IDs ordered by relevance
        """
        # Use the full search function
        products = self.search(query, top_k, min_price, max_price, category)
        
        # Extract and return only IDs
        return [p.get('id') for p in products if p.get('id') is not None]
    
    def recommend_by_product_id(
        self, 
        product_id: int, 
        top_k: int = 10,
        same_category: bool = True,
        price_tolerance: float = 0.5  # 50% price range by default
    ) -> List[int]:
        """
        Get recommended product IDs based on a source product.
        
        Process:
        1. Fetch product from DB (get cluster_id, name, category, price)
        2. Vectorize product name with TF-IDF
        3. Find K nearest neighbors
        4. Optionally filter by same category and similar price range
        5. Apply cluster boost (1.5x if same cluster)
        6. Return list of product IDs only
        
        Args:
            product_id: Source product ID
            top_k: Number of recommendations to return
            same_category: If True, only recommend products from same category
            price_tolerance: Price range tolerance (0.5 = ±50% of source price)
        """
        # Get source product
        source_product = db.get_product_by_id(product_id)
        if not source_product:
            return []
        
        # Extract product features
        product_name = source_product.get('name', '')
        source_category = source_product.get('category')
        source_price = float(source_product.get('price', 0))  # Convert Decimal to float
        source_cluster = source_product.get('cluster_id')
        
        # Calculate price range if filtering enabled
        min_price = None
        max_price = None
        if price_tolerance and source_price > 0:
            min_price = source_price * (1 - price_tolerance)
            max_price = source_price * (1 + price_tolerance)
        
        # Use the search function with product name and filters
        category_filter = source_category if same_category else None
        
        # Search for similar products
        similar_products = self.search(
            query=product_name,
            top_k=top_k * 3,  # Get more to account for filtering
            min_price=min_price,
            max_price=max_price,
            category=category_filter
        )
        
        # Filter out the source product and apply cluster boosting
        recommendations = []
        for p in similar_products:
            rec_id = p.get('id')
            
            # Skip the source product itself
            if rec_id == product_id:
                continue
            
            score = p.get('similarity', 0)
            
            # Apply cluster boost if in same cluster
            if source_cluster is not None and p.get('cluster_id') == source_cluster:
                score *= 1.5
            
            recommendations.append({'id': rec_id, 'score': score})
            
            # Stop when we have enough
            if len(recommendations) >= top_k:
                break
        
        # Sort by score and return top_k IDs
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return [r['id'] for r in recommendations[:top_k]]
    
    def search_to_dict(
        self,
        query: str,
        top_k: int = 10,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Search and return results as a dictionary for API response."""
        products = self.search(query, top_k, min_price, max_price, category)
        
        if not products:
            return {
                "products": [],
                "count": 0,
                "query": query,
                "match_type": "No Results"
            }
        
        # Get match type from first result
        match_type = products[0].get('match_type', 'Direct Search')
        
        # Format response with new schema columns
        formatted_products = []
        for p in products:
            formatted_products.append({
                "id": int(p.get('id', 0)),
                "name": str(p.get('name', 'N/A')),
                "price": float(p.get('price') or 0),
                "category": str(p.get('category', 'N/A')),
                "image": str(p.get('image_url', '')),
                "stock_quantity": int(p.get('stock_quantity') or 0),
                "similarity": p.get('similarity', 0),
                "final_score": p.get('final_score', 0),
                "match_type": p.get('match_type', 'Direct Search')
            })
        
        return {
            "products": formatted_products,
            "count": len(formatted_products),
            "query": query,
            "match_type": match_type
        }
    
    def get_categories(self) -> List[str]:
        """Get list of available categories from MySQL."""
        return db.get_categories()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get database statistics from MySQL."""
        return db.get_stats()


# Singleton instance
engine = SearchEngine()
