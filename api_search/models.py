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


class IDListResponse(BaseModel):
    """Response containing only product IDs."""
    product_ids: List[int]
    count: int
    query: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "product_ids": [202409, 303765, 202445, 206113, 256186],
                "count": 5,
                "query": "laptop"
            }
        }


class RecommendationResponse(BaseModel):
    """Product recommendation response."""
    source_product_id: int
    recommended_ids: List[int]
    count: int
    filters: dict
    
    class Config:
        json_schema_extra = {
            "example": {
                "source_product_id": 1,
                "recommended_ids": [606769, 755685, 608335, 608177, 388937],
                "count": 5,
                "filters": {
                    "same_category": True,
                    "price_tolerance": 0.5
                }
            }
        }


class StatsResponse(BaseModel):
    """Database statistics response."""
    total_products: int
    avg_price: float
    categories: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "total_products": 837291,
                "avg_price": 62.17,
                "categories": 10
            }
        }


class CategoriesResponse(BaseModel):
    """Available categories response."""
    categories: List[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "categories": [
                    "Automotive & Industrial",
                    "Beauty, Health & Personal Care",
                    "Electronics & Computers"
                ]
            }
        }
