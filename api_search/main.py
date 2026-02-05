"""
Simple Search API - FastAPI Application
Connects to MySQL and provides search endpoints
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from contextlib import asynccontextmanager

from .config import CORS_ORIGINS
from .engine import engine
from .database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load engine on startup, cleanup on shutdown."""
    print("Starting Simple Search API...")
    if not engine.load():
        print("[WARN] Search engine failed to load")
    yield
    # Cleanup
    db.disconnect()
    print("Search API shutdown complete")


app = FastAPI(
    title="E-Commerce Product Search & Recommendation API",
    description="""
## Overview
Advanced product search and recommendation API powered by TF-IDF and KNN machine learning models.

### Features
* **Smart Search** - TF-IDF based semantic search with fallback to trending products
* **Intelligent Recommendations** - ML-powered product recommendations with category and price filtering
* **Flexible Filtering** - Search by price range, category, and more
* **ID-Only Endpoints** - Optimized endpoints returning only product IDs for client-side caching

### Data
* **837,291+ products** across 10 categories
* Real-time MySQL database connectivity
* Schema aligned with production e-commerce database

### Technology Stack
* FastAPI for high-performance APIs
* MySQL for data persistence
* Scikit-learn for ML models (TF-IDF, KNN, K-Means)
* Pandas + NumPy for data processing
    """,
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "API Support",
        "url": "https://github.com/yourusername/ecommerce-api",
    },
    license_info={
        "name": "MIT",
    },
    openapi_tags=[
        {
            "name": "health",
            "description": "Health check and system status endpoints"
        },
        {
            "name": "search",
            "description": "Product search endpoints with various filtering options"
        },
        {
            "name": "recommendations",
            "description": "ML-powered product recommendation endpoints"
        },
        {
            "name": "products",
            "description": "Product data retrieval endpoints"
        },
        {
            "name": "metadata",
            "description": "Category and statistics endpoints"
        }
    ]
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "Simple Search API (MySQL)",
        "engine_loaded": engine.is_loaded,
        "database_connected": db.is_connected
    }


@app.get("/health")
async def health():
    """Health check."""
    return {
        "status": "healthy" if engine.is_loaded and db.is_connected else "unhealthy",
        "database": db.is_connected,
        "engine": engine.is_loaded
    }


@app.get("/stats")
async def stats():
    """Get database statistics."""
    if not db.is_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    return engine.get_stats()


@app.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    top_k: int = Query(10, ge=1, le=100, description="Number of results"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    category: Optional[str] = Query(None, description="Category filter")
):
    """
    Search for products with TF-IDF similarity and fallback logic.
    
    Returns trending products if:
    - Query is empty
    - Query contains unknown words
    - No matches above 5% similarity
    - Filters eliminate all results
    """
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    try:
        results = engine.search_to_dict(
            query=q,
            top_k=top_k,
            min_price=min_price,
            max_price=max_price,
            category=category
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search/ids")
async def search_ids(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(10, ge=1, le=100, description="Number of results"),
    min_price: float = Query(None, ge=0, description="Minimum price filter"),
    max_price: float = Query(None, ge=0, description="Maximum price filter"),
    category: str = Query(None, description="Category filter")
):
    """
    Search for products and return only product IDs.
    
    Same search logic as /search but returns only IDs instead of full product details.
    Useful for client-side caching or when you only need IDs.
    """
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    try:
        product_ids = engine.search_ids(
            query=q,
            top_k=top_k,
            min_price=min_price,
            max_price=max_price,
            category=category
        )
        return {
            "product_ids": product_ids,
            "count": len(product_ids),
            "query": q
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommendations/{product_id}", response_model=List[int], tags=["Spring Boot Integration"])
async def java_backend_recommendations(product_id: int):
    """
    Specific endpoint to satisfy the Java RecommendationClient contract.

    1. Matches the path: /api/recommendations/{id}
    2. Returns a raw list: [101, 102, 103]
    """
    if not engine.is_loaded:
        # Return empty list if engine is down, so Java doesn't crash
        print("[WARN] Engine not loaded, returning empty recommendations to Java")
        return []

    try:
        # Reuse your existing logic!
        # We use 'same_category=True' as a safe default for the e-commerce site
        recommended_ids = engine.recommend_by_product_id(
            product_id,
            top_k=10,
            same_category=True,
            price_tolerance=0.5
        )

        # Java expects JUST the list, not a JSON object with "count" or "filters"
        return recommended_ids

    except Exception as e:
        print(f"[ERROR] Failed to generate recommendations for Java: {str(e)}")
        # Return empty list on error to keep the Java frontend running smoothly
        return []
@app.get("/trending")
async def trending(
    n: int = Query(10, ge=1, le=50, description="Number of trending products")
):
    """Get trending/bestseller products."""
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    try:
        results = engine.get_trending_products(n, reason="Trending Request")
        
        # Format response with new schema columns
        products = []
        for p in results:
            products.append({
                "id": int(p.get('id', 0)),
                "name": str(p.get('name', 'N/A')),
                "price": float(p.get('price') or 0),
                "category": str(p.get('category', 'N/A')),
                "image": str(p.get('image_url', '')),
                "stock_quantity": int(p.get('stock_quantity') or 0),
                "similarity": 0.0,
                "match_type": "Trending"
            })
        
        return {
            "products": products,
            "count": len(products),
            "reason": "Trending Request"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommend/{product_id}")
async def recommend(
    product_id: int,
    top_k: int = Query(10, ge=1, le=50, description="Number of recommendations"),
    same_category: bool = Query(True, description="Only recommend from same category"),
    price_tolerance: float = Query(0.5, ge=0, le=2.0, description="Price range tolerance (0.5 = ±50%)")
):
    """
    Get recommended products for a given product ID. Returns list of product IDs.
    
    - **same_category**: If true, only recommends products from the same category
    - **price_tolerance**: Price range filter (0.5 = ±50% of source price, 0 = no filter)
    """
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    try:
        recommended_ids = engine.recommend_by_product_id(
            product_id, 
            top_k,
            same_category=same_category,
            price_tolerance=price_tolerance
        )
        return {
            "source_product_id": product_id,
            "recommended_ids": recommended_ids,
            "count": len(recommended_ids),
            "filters": {
                "same_category": same_category,
                "price_tolerance": price_tolerance
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
async def categories():
    """Get list of available categories."""
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    return {"categories": engine.get_categories()}


@app.get("/products/{product_id}")
async def get_product(product_id: int):
    """Get a single product by ID from the database."""
    if not db.is_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    product = db.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return product


@app.get("/products")
async def list_products(
    limit: int = Query(50, ge=1, le=500, description="Max products to return")
):
    """List all products from the database."""
    if not db.is_connected:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    products = db.get_all_products(limit=limit)
    return {
        "products": products,
        "count": len(products)
    }
