"""
Pydantic models for request/response validation
"""
from typing import Optional, List
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Request model for search endpoint."""
    query: str = Field(..., min_length=1, description="Search query string")
    top_k: int = Field(default=10, ge=1, le=100, description="Number of results to return")
    min_price: Optional[float] = Field(default=None, ge=0, description="Minimum price filter")
    max_price: Optional[float] = Field(default=None, ge=0, description="Maximum price filter")
    category: Optional[str] = Field(default=None, description="Category filter")


class Product(BaseModel):
    """Product model for API response."""
    title: str
    price: float
    stars: float
    reviews: int
    category: str
    similarity: float
    final_score: float
    image: str = ""


class SearchResponse(BaseModel):
    """Response model for search endpoint."""
    products: List[Product]
    count: int
    query: str


class StatsResponse(BaseModel):
    """Response model for stats endpoint."""
    total_products: int
    categories: int
    avg_price: float
    avg_rating: float


class CategoriesResponse(BaseModel):
    """Response model for categories endpoint."""
    categories: List[str]


class HealthResponse(BaseModel):
    """Response model for health check."""
    status: str
    service: str
    engine_loaded: bool
