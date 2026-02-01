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
    Search for product recommendations.
    
    - **query**: The search query (required)
    - **top_k**: Number of results to return (default: 10, max: 100)
    - **min_price**: Minimum price filter (optional)
    - **max_price**: Maximum price filter (optional)
    - **category**: Category filter (optional)
    """
    return engine.get_recommendations(
        query=request.query,
        top_k=request.top_k,
        min_price=request.min_price,
        max_price=request.max_price,
        category=request.category
    )


@router.get("/api/search", response_model=SearchResponse, tags=["Recommendations"])
async def search_get(
    query: str,
    top_k: int = 10,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    category: Optional[str] = None
):
    """
    Search for product recommendations (GET version).
    
    - **query**: The search query (required)
    - **top_k**: Number of results to return (default: 10)
    - **min_price**: Minimum price filter (optional)
    - **max_price**: Maximum price filter (optional)
    - **category**: Category filter (optional)
    """
    return engine.get_recommendations(
        query=query,
        top_k=top_k,
        min_price=min_price,
        max_price=max_price,
        category=category
    )


@router.get("/api/stats", response_model=StatsResponse, tags=["Info"])
async def stats():
    """Get engine statistics including total products, categories, and averages."""
    return engine.get_stats()


@router.get("/api/categories", response_model=CategoriesResponse, tags=["Info"])
async def categories():
    """Get list of available product categories."""
    return CategoriesResponse(categories=engine.get_categories())
