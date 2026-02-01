"""
Configuration settings for the API
"""
import os
from pathlib import Path

# Base directory (parent of api folder)
BASE_DIR = Path(__file__).resolve().parent.parent

# Model path
MODEL_PATH = os.environ.get(
    "MODEL_PATH", 
    str(BASE_DIR / "recommendation_engine_tf_idf.pkl")
)

# Server settings
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 8000))
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# CORS settings
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

# MongoDB settings
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DATABASE = os.environ.get("MONGODB_DATABASE", "recommendation_system")
