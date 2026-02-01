"""
API Routes - All endpoint definitions
"""
from typing import Optional
from fastapi import APIRouter

from .models import (
    SearchRequest, 
    SearchResponse, 
    StatsResponse, 
    CategoriesResponse,
    HealthResponse
)
from .engine import engine


# Create router
router = APIRouter()


@router.get("/", response_model=HealthResponse, tags=["Health"])
async def root():
    """Health check endpoint."""
    return HealthResponse(
        status="online",
        service="Product Recommendation API",
        engine_loaded=engine.is_loaded
    )


@router.post("/api/search", response_model=SearchResponse, tags=["Recommendations"])
async def search(request: SearchRequest):
    """
    Search for product recommendations with optional filters.
    
    - **query**: The search query (required)
    - **top_k**: Number of results to return (default: 10, max: 100)
    - **min_price** / **max_price**: Price range filters
    - **category**: Super category filter (e.g., 'Electronics & Computers')
    - **category_name**: Specific category name filter
    - **min_stars**: Minimum star rating (0-5)
    - **min_reviews**: Minimum number of reviews
    - **sort_by**: Sort order ('relevance', 'price_low', 'price_high', 'rating', 'reviews')
    """
    return engine.get_recommendations(
        query=request.query,
        top_k=request.top_k,
        min_price=request.min_price,
        max_price=request.max_price,
        category=request.category,
        category_name=request.category_name,
        min_stars=request.min_stars,
        min_reviews=request.min_reviews,
        sort_by=request.sort_by
    )


@router.get("/api/search", response_model=SearchResponse, tags=["Recommendations"])
async def search_get(
    query: str,
    top_k: int = 10,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    category: Optional[str] = None,
    category_name: Optional[str] = None,
    min_stars: Optional[float] = None,
    min_reviews: Optional[int] = None,
    sort_by: str = "relevance"
):
    """
    Search for product recommendations (GET version).
    
    - **query**: The search query (required)
    - **top_k**: Number of results (default: 10)
    - **min_price** / **max_price**: Price range filters
    - **category**: Super category filter
    - **category_name**: Specific category name filter
    - **min_stars**: Minimum star rating (0-5)
    - **min_reviews**: Minimum number of reviews
    - **sort_by**: Sort order ('relevance', 'price_low', 'price_high', 'rating', 'reviews')
    """
    return engine.get_recommendations(
        query=query,
        top_k=top_k,
        min_price=min_price,
        max_price=max_price,
        category=category,
        category_name=category_name,
        min_stars=min_stars,
        min_reviews=min_reviews,
        sort_by=sort_by
    )


@router.get("/api/stats", response_model=StatsResponse, tags=["Info"])
async def stats():
    """Get engine statistics including total products, categories, and averages."""
    return engine.get_stats()


@router.get("/api/categories", response_model=CategoriesResponse, tags=["Info"])
async def categories():
    """Get list of available product categories."""
    return CategoriesResponse(categories=engine.get_categories())
