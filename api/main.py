"""
Product Recommendation System - FastAPI Application
Main entry point for the API server
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import MODEL_PATH, CORS_ORIGINS
from .engine import engine
from .routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the recommendation engine on startup."""
    engine.load(MODEL_PATH)
    yield
    # Cleanup (if needed)


# Create FastAPI application
app = FastAPI(
    title="Product Recommendation API",
    description="REST API for product recommendations using TF-IDF similarity",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)
