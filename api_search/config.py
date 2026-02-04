"""
Configuration settings for the Simple SQL Search API
"""
import os
from pathlib import Path

# Base directory (parent of api_search folder)
BASE_DIR = Path(__file__).resolve().parent.parent

# Model path (for TF-IDF search)
MODEL_PATH = os.environ.get(
    "MODEL_PATH", 
    str(BASE_DIR / "recommendation_engine_tf_idf.pkl")
)

# Server settings
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", 8002))
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"

# CORS settings
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

# MySQL settings
MYSQL_HOST = os.environ.get("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", 3306))
MYSQL_USER = os.environ.get("MYSQL_USER", "root")
MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.environ.get("MYSQL_DATABASE", "ecomrecom")
