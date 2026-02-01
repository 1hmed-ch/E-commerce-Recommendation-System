# Product Recommendation API

A FastAPI-based REST API for product recommendations using TF-IDF similarity search with MongoDB storage.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- MongoDB (running locally on port 27017)
- The trained model file: `recommendation_engine_tf_idf.pkl`

### Installation

```bash
# Install dependencies
pip install -r api/requirements.txt

# Migrate products to MongoDB (first time only)
python migrate_to_mongodb.py

# Start the API server
python run_api.py
```

The server will start at **http://localhost:8000**

### Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📡 API Endpoints

### Search Products
**POST** `/api/search` or **GET** `/api/search`

Search for product recommendations with optional filters.

#### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ Yes | - | Search query (e.g., "gaming headset") |
| `top_k` | int | No | 10 | Number of results (1-100) |
| `min_price` | float | No | - | Minimum price filter |
| `max_price` | float | No | - | Maximum price filter |
| `category` | string | No | - | Super category filter |
| `category_name` | string | No | - | Specific category name (regex) |
| `min_stars` | float | No | - | Minimum rating (0-5) |
| `min_reviews` | int | No | - | Minimum review count |
| `sort_by` | string | No | "relevance" | Sort order |

#### Sort Options
- `relevance` - Hybrid score (similarity + rating + reviews)
- `price_low` - Lowest price first
- `price_high` - Highest price first
- `rating` - Highest rated first
- `reviews` - Most reviewed first

#### Example Requests

**GET Request:**
```bash
curl "http://localhost:8000/api/search?query=gaming%20headset&top_k=5&min_price=50&max_price=150&min_stars=4"
```

**POST Request:**
```bash
curl -X POST "http://localhost:8000/api/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "gaming headset",
    "top_k": 5,
    "min_price": 50,
    "max_price": 150,
    "min_stars": 4,
    "category": "Electronics & Computers",
    "sort_by": "rating"
  }'
```

**Python Example:**
```python
import requests

# GET request
response = requests.get("http://localhost:8000/api/search", params={
    "query": "wireless mouse",
    "top_k": 10,
    "category": "Electronics & Computers"
})

# POST request
response = requests.post("http://localhost:8000/api/search", json={
    "query": "running shoes",
    "top_k": 5,
    "min_price": 50,
    "max_price": 150,
    "min_stars": 4,
    "sort_by": "price_low"
})

products = response.json()["products"]
for p in products:
    print(f"{p['title']} - ${p['price']} ({p['stars']}⭐)")
```

#### Response Format

```json
{
  "products": [
    {
      "title": "Gaming Headset Pro",
      "price": 79.99,
      "stars": 4.5,
      "reviews": 1234,
      "category": "Electronics & Computers",
      "similarity": 85.5,
      "final_score": 78.2,
      "image": "https://..."
    }
  ],
  "count": 5,
  "query": "gaming headset"
}
```

---

### Get Categories
**GET** `/api/categories`

Returns all available super categories.

```bash
curl "http://localhost:8000/api/categories"
```

**Response:**
```json
{
  "categories": [
    "Automotive & Industrial",
    "Beauty, Health & Personal Care",
    "Electronics & Computers",
    "Food & Grocery",
    "Home, Kitchen & Garden",
    "Men's Fashion",
    "Sports & Outdoors",
    "Tools & Home Improvement",
    "Toys, Kids & Baby",
    "Women's Fashion"
  ]
}
```

---

### Get Statistics
**GET** `/api/stats`

Returns database statistics.

```bash
curl "http://localhost:8000/api/stats"
```

**Response:**
```json
{
  "total_products": 837291,
  "categories": 10,
  "avg_price": 62.17,
  "avg_rating": 4.4
}
```

---

### Health Check
**GET** `/`

Check if the API is running and the engine is loaded.

```bash
curl "http://localhost:8000/"
```

**Response:**
```json
{
  "status": "online",
  "service": "Product Recommendation API",
  "engine_loaded": true
}
```

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│   FastAPI    │────▶│   MongoDB   │
│  (Request)  │     │   Server     │     │  (Products) │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │  TF-IDF      │
                    │  (In-Memory) │
                    └──────────────┘
```

**How it works:**
1. User sends a search query
2. Query is vectorized using TF-IDF
3. Nearest neighbors finds similar products (in-memory, fast!)
4. Matching product details are fetched from MongoDB
5. Filters are applied (price, category, rating, etc.)
6. Results are ranked and returned

---

## 📁 Project Structure

```
sys_rec/
├── api/
│   ├── __init__.py       # Package init
│   ├── config.py         # Configuration settings
│   ├── database.py       # MongoDB connection
│   ├── engine.py         # Recommendation logic
│   ├── main.py           # FastAPI app factory
│   ├── models.py         # Pydantic models
│   ├── routes.py         # API endpoints
│   └── requirements.txt  # Dependencies
├── run_api.py            # Start server
├── migrate_to_mongodb.py # Load data into MongoDB
├── recommendation_engine_tf_idf.pkl  # Trained model
└── README.md             # This file
```

---

## ⚙️ Configuration

Configure via environment variables or `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | `./recommendation_engine_tf_idf.pkl` | Path to the model file |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `MONGODB_DATABASE` | `recommendation_system` | Database name |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |

Example `.env` file:
```bash
MODEL_PATH=C:/path/to/recommendation_engine_tf_idf.pkl
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=recommendation_system
PORT=8000
```

---

## 🔧 Development

### Run with auto-reload
```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run tests
```bash
# Test the API
curl "http://localhost:8000/api/search?query=laptop&top_k=3"
```

---

## 📊 Model Details

- **Algorithm**: TF-IDF + Nearest Neighbors
- **Features**: 25,000 TF-IDF features
- **Products**: 837,291 indexed products
- **Ranking**: Hybrid scoring (70% similarity + 20% rating + 10% reviews)

---

## 📝 License

MIT License
