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
    title="Simple Search API",
    description="Simple SQL-based product search API with TF-IDF and fallback logic",
    version="1.0.0",
    lifespan=lifespan
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


@app.get("/trending")
async def trending(
    n: int = Query(10, ge=1, le=50, description="Number of trending products")
):
    """Get trending/bestseller products."""
    if not engine.is_loaded:
        raise HTTPException(status_code=503, detail="Search engine not loaded")
    
    try:
        results = engine.get_trending_products(n, reason="Trending Request")
        
        # Format response (results is now a list of dicts)
        products = []
        for p in results:
            products.append({
                "asin": str(p.get('asin', '')),
                "title": str(p.get('title', 'N/A')),
                "price": float(p.get('price') or 0),
                "stars": float(p.get('stars') or 0),
                "reviews": int(p.get('reviews') or 0),
                "category": str(p.get('super_category', 'N/A')),
                "image": str(p.get('imgUrl', '')),
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
