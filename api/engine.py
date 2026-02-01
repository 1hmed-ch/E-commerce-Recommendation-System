"""
Recommendation Engine - Core logic for product recommendations
"""
import re
import joblib
import numpy as np
from typing import Optional, List
from fastapi import HTTPException
from nltk.stem import PorterStemmer

from .models import Product, SearchResponse, StatsResponse


class RecommendationEngine:
    """Handles all recommendation logic."""
    
    def __init__(self):
        self.engine_data = None
        self.stemmer = PorterStemmer()
        self.is_loaded = False
    
    def load(self, pkl_path: str) -> bool:
        """Load the recommendation engine artifacts."""
        try:
            print(f"Loading recommendation engine from: {pkl_path}")
            self.engine_data = joblib.load(pkl_path)
            self.is_loaded = True
            print("✅ Recommendation engine loaded successfully!")
            print(f"   Keys in bundle: {list(self.engine_data.keys()) if isinstance(self.engine_data, dict) else 'Not a dict'}")
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
        category: Optional[str] = None
    ) -> SearchResponse:
        """Get product recommendations based on the query."""
        
        if not self.is_loaded or self.engine_data is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")
        
        try:
            # Extract components from the engine
            df = self.engine_data.get('data')
            vectorizer = self.engine_data.get('vectorizer')
            search_model = self.engine_data.get('search_model')
            
            if df is None or vectorizer is None or search_model is None:
                raise HTTPException(status_code=500, detail="Missing components in the recommendation engine")
            
            # Clean and vectorize query
            clean_q = self.clean_query(query)
            query_vec = vectorizer.transform([clean_q])
            
            # Get nearest neighbors
            distances, indices = search_model.kneighbors(query_vec, n_neighbors=min(500, len(df)))
            
            # Build results
            results = df.iloc[indices[0]].copy()
            results['similarity'] = (1 - distances[0]) * 100  # Convert to percentage
            
            # Apply filters
            if min_price is not None and min_price > 0:
                results = results[results['price'] >= min_price]
            if max_price is not None and max_price > 0:
                results = results[results['price'] <= max_price]
            if category is not None and category != '' and category != 'All Categories':
                results = results[results['super_category'] == category]
            
            if results.empty:
                return SearchResponse(products=[], count=0, query=query)
            
            # Hybrid scoring: 70% similarity + 20% stars + 10% reviews
            results['star_score'] = results['stars'].rank(pct=True) if 'stars' in results.columns else 0.5
            results['review_score'] = np.log1p(results['reviews']).rank(pct=True) if 'reviews' in results.columns else 0.5
            results['final_score'] = (
                results['similarity'] * 0.70 +
                results['star_score'] * 20 +
                results['review_score'] * 10
            )
            
            # Sort and return top results
            results = results.sort_values('final_score', ascending=False).head(top_k)
            
            # Convert to list of Product objects
            products = []
            for _, row in results.iterrows():
                product = Product(
                    title=str(row.get('title', 'N/A'))[:100],
                    price=float(row.get('price', 0)),
                    stars=float(row.get('stars', 0)),
                    reviews=int(row.get('reviews', 0)) if 'reviews' in row else 0,
                    category=str(row.get('super_category', 'N/A')),
                    similarity=round(float(row.get('similarity', 0)), 2),
                    final_score=round(float(row.get('final_score', 0)), 2),
                    image=str(row.get('imgUrl', '')) if 'imgUrl' in row else ''
                )
                products.append(product)
            
            return SearchResponse(products=products, count=len(products), query=query)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_categories(self) -> List[str]:
        """Get list of available categories."""
        if not self.is_loaded or self.engine_data is None:
            return []
        
        df = self.engine_data.get('data')
        if df is not None and 'super_category' in df.columns:
            return sorted(df['super_category'].unique().tolist())
        return []
    
    def get_stats(self) -> StatsResponse:
        """Get engine statistics."""
        if not self.is_loaded or self.engine_data is None:
            raise HTTPException(status_code=503, detail="Recommendation engine not loaded")
        
        df = self.engine_data.get('data')
        if df is not None:
            return StatsResponse(
                total_products=len(df),
                categories=df['super_category'].nunique() if 'super_category' in df.columns else 0,
                avg_price=round(df['price'].mean(), 2) if 'price' in df.columns else 0,
                avg_rating=round(df['stars'].mean(), 2) if 'stars' in df.columns else 0
            )
        raise HTTPException(status_code=500, detail="No data available")


# Singleton instance
engine = RecommendationEngine()
