"""
API Routes - All endpoint definitions
"""
from fastapi import APIRouter

from .models import (
    SearchRequest, 
    SearchResponseSlim,
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


@router.post("/api/search", response_model=SearchResponseSlim, tags=["Recommendations"])
async def search(request: SearchRequest):
    """
    Search for product recommendations - returns ASIN IDs only.
    
    - **query**: The search query (required)
    - **top_k**: Number of results to return (default: 10, max: 100)
    
    Returns a list of ASIN IDs with similarity scores.
    Use the ASIN to fetch full product details from your database.
    """
    return engine.get_recommendations_slim(
        query=request.query,
        top_k=request.top_k
    )


@router.get("/api/search", response_model=SearchResponseSlim, tags=["Recommendations"])
async def search_get(
    query: str,
    top_k: int = 10
):
    """
    Search for product recommendations (GET version) - returns ASIN IDs only.
    
    - **query**: The search query (required)
    - **top_k**: Number of results (default: 10)
    
    Returns a list of ASIN IDs with similarity scores.
    """
    return engine.get_recommendations_slim(
        query=query,
        top_k=top_k
    )

@router.get("/api/stats", response_model=StatsResponse, tags=["Info"])
async def stats():
    """Get engine statistics including total products, categories, and averages."""
    return engine.get_stats()


@router.get("/api/categories", response_model=CategoriesResponse, tags=["Info"])
async def categories():
    """Get list of available product categories."""
    return CategoriesResponse(categories=engine.get_categories())
