"""
Pydantic models for API request/response validation
"""
from typing import Optional, List
from pydantic import BaseModel


class ProductResponse(BaseModel):
    """Product data from database."""
    id: int
    name: str
    price: float
    brand: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    similarity: float = 0.0
    match_type: str = "Direct Search"


class SearchRequest(BaseModel):
    """Search request parameters."""
    query: str
    top_k: int = 10
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    category: Optional[str] = None


class SearchResponse(BaseModel):
    """Search response with products."""
    products: List[ProductResponse]
    count: int
    query: str
    match_type: str = "Direct Search"


class TrendingResponse(BaseModel):
    """Trending products response."""
    products: List[ProductResponse]
    count: int
    reason: str
