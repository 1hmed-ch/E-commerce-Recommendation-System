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
        Production-ready search with 3-stage fallback.
        All product data is fetched from MySQL.
        
        1. Direct Match -> 2. Broad Match -> 3. Trending Items
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
        
        # --- STAGE 2: RETRIEVAL & SAFETY GATING ---
        n_neighbors = min(500, len(self.product_asins))
        distances, indices = self.search_model.kneighbors(query_vec, n_neighbors=n_neighbors)
        
        # Get ASINs and similarity scores for matched products
        matching_asins = [self.product_asins[i] for i in indices[0]]
        similarity_scores = {
            asin: (1 - dist) * 100 
            for asin, dist in zip(matching_asins, distances[0])
        }
        
        # Check max similarity
        max_sim = max(similarity_scores.values()) if similarity_scores else 0
        if max_sim < 5.0:
            print(f"[WARN] Low similarity for '{query}'. Switching to Trending.")
            return self.get_trending_products(top_k, reason="Low Relevance")
        
        # Filter ASINs with similarity > 5%
        filtered_asins = [asin for asin, sim in similarity_scores.items() if sim > 5.0]
        
        # --- STAGE 3: FETCH FROM MySQL WITH FILTERS ---
        products = db.search_products_with_filters(
            asins=filtered_asins,
            min_price=min_price,
            max_price=max_price,
            category=category
        )
        
        if not products:
            return self.get_trending_products(top_k, reason="No matches after filters")
        
        # --- STAGE 4: CLUSTER INTELLIGENCE ---
        predicted_cluster = None
        if self.kmeans is not None:
            predicted_cluster = self.kmeans.predict(query_vec)[0]
        
        # --- STAGE 5: SCORING & RANKING ---
        # Pre-compute global scores for ranking
        all_stars = [p.get('stars') or 0 for p in products]
        all_reviews = [np.log1p(p.get('reviews') or 0) for p in products]
        
        # Rank percentiles
        if len(all_stars) > 1:
            star_ranks = pd.Series(all_stars).rank(pct=True).tolist()
            rev_ranks = pd.Series(all_reviews).rank(pct=True).tolist()
        else:
            star_ranks = [0.5] * len(products)
            rev_ranks = [0.5] * len(products)
        
        scored_products = []
        for i, p in enumerate(products):
            asin = p.get('asin')
            similarity = similarity_scores.get(asin, 0)
            
            # Cluster boost (1.5x if in predicted cluster)
            cluster_multiplier = 1.0
            if predicted_cluster is not None and p.get('cluster_id') == predicted_cluster:
                cluster_multiplier = 1.5
            
            boosted_sim = similarity * cluster_multiplier
            
            # Final score: 60% text + 20% stars + 20% reviews
            final_score = (
                (boosted_sim * 0.6) +
                (star_ranks[i] * 100 * 0.2) +
                (rev_ranks[i] * 100 * 0.2)
            )
            
            p['similarity'] = round(similarity, 2)
            p['final_score'] = round(final_score, 2)
            p['match_type'] = "Direct Search"
            scored_products.append(p)
        
        # Sort by final score and return top_k
        scored_products.sort(key=lambda x: x['final_score'], reverse=True)
        return scored_products[:top_k]
    
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
        
        # Format response
        formatted_products = []
        for p in products:
            formatted_products.append({
                "asin": str(p.get('asin', '')),
                "title": str(p.get('title', 'N/A')),
                "price": float(p.get('price') or 0),
                "stars": float(p.get('stars') or 0),
                "reviews": int(p.get('reviews') or 0),
                "category": str(p.get('super_category', 'N/A')),
                "image": str(p.get('imgUrl', '')),
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
