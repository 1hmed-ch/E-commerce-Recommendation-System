"""
Run the Simple Search API server
"""
import uvicorn
from api_search.config import HOST, PORT, DEBUG

if __name__ == "__main__":
    uvicorn.run(
        "api_search.main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )
