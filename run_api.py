"""
Run script for the FastAPI Recommendation API
Usage: python run_api.py
"""
import uvicorn
from api.config import HOST, PORT, DEBUG

if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("   RECOMMENDATION SYSTEM - FastAPI")
    print("=" * 60)
    print("   Starting server...")
    print(f"   API Docs: http://127.0.0.1:{PORT}/docs")
    print(f"   ReDoc: http://127.0.0.1:{PORT}/redoc")
    print("=" * 60 + "\n")
    
    uvicorn.run(
        "api.main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG
    )
