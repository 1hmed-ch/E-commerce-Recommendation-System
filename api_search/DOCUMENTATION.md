# API Search Module - Complete Documentation

## Overview

The `api_search` module is a FastAPI-based product search API that uses:
- **TF-IDF** (Term Frequency-Inverse Document Frequency) for text similarity matching
- **KMeans clustering** for intelligent product grouping
- **MySQL** for product data storage and retrieval

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FastAPI (main.py)                        │
│                    Endpoints: /search, /trending, etc.           │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SearchEngine (engine.py)                    │
│         TF-IDF matching + KMeans clustering + Scoring            │
└─────────────────────────────────────────────────────────────────┘
          │                                        │
          ▼                                        ▼
┌──────────────────────┐              ┌──────────────────────────┐
│   Pickle File (.pkl) │              │   MySQL (database.py)    │
│  - TF-IDF vectorizer │              │  - Product data          │
│  - Search model (KNN)│              │  - Filters & queries     │
│  - KMeans model      │              │  - Trending products     │
│  - ASIN mapping      │              └──────────────────────────┘
└──────────────────────┘
```

---

## File: `config.py`

Configuration settings loaded from environment variables.

```python
# Base directory calculation
BASE_DIR = Path(__file__).resolve().parent.parent
# Gets the parent of api_search folder (sys_rec/)

# Model path - where the pickle file with TF-IDF model is stored
MODEL_PATH = os.environ.get(
    "MODEL_PATH", 
    str(BASE_DIR / "recommendation_engine_tf_idf.pkl")
)
# Default: sys_rec/recommendation_engine_tf_idf.pkl

# Server settings
HOST = "0.0.0.0"      # Listen on all interfaces
PORT = 8002           # API port
DEBUG = false         # Debug mode

# MySQL connection settings
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_DATABASE = "ecomrecom"
```

---

## File: `database.py`

MySQL database connection manager for all product operations.

### Class: `MySQLDatabase`

#### Constants
```python
PRODUCT_COLUMNS = [
    'id', 'asin', 'title', 'imgUrl', 'stars', 'reviews', 'price',
    'categoryName', 'isBestSeller', 'super_category', 
    'price_log', 'review_log', 'clean_title', 'semantic_text', 'cluster_id'
]
# List of all columns to fetch from products table
```

#### Method: `connect()`
```python
def connect(self) -> bool:
```
- **Purpose**: Establish connection to MySQL database
- **Returns**: `True` if connected, `False` if failed
- **Process**:
  1. Attempts connection using config settings
  2. Tests connection with `SELECT 1`
  3. Sets `is_connected` flag

#### Method: `get_cursor(dictionary=True)`
```python
@contextmanager
def get_cursor(self, dictionary: bool = True):
```
- **Purpose**: Context manager for safe cursor handling
- **Parameters**: `dictionary` - if True, returns rows as dicts
- **Process**:
  1. Creates cursor
  2. Yields cursor for use
  3. Commits on success, rollback on error
  4. Always closes cursor

#### Method: `get_product_count()`
```python
def get_product_count(self) -> int:
```
- **Purpose**: Get total number of products
- **SQL**: `SELECT COUNT(*) FROM products`
- **Returns**: Integer count (837,291 in your case)

#### Method: `get_product_by_id(product_id)`
```python
def get_product_by_id(self, product_id: int) -> Optional[Dict]:
```
- **Purpose**: Fetch single product by primary key
- **SQL**: `SELECT ... FROM products WHERE id = %s`
- **Returns**: Product dict or None

#### Method: `get_products_by_asins(asins)`
```python
def get_products_by_asins(self, asins: List[str]) -> List[Dict]:
```
- **Purpose**: Fetch multiple products by ASIN codes
- **SQL**: `SELECT ... FROM products WHERE asin IN (...)`
- **Used by**: Search engine after TF-IDF matching

#### Method: `get_trending_products(top_n)`
```python
def get_trending_products(self, top_n: int = 10) -> List[Dict]:
```
- **Purpose**: Get bestselling products
- **Formula**: `trending_score = stars * LOG(reviews + 1)`
- **SQL**: 
```sql
SELECT *, (stars * LOG(reviews + 1)) as trending_score
FROM products 
ORDER BY trending_score DESC
LIMIT n
```
- **Used for**: Fallback when search fails

#### Method: `search_products_with_filters(asins, min_price, max_price, category)`
```python
def search_products_with_filters(
    self,
    asins: List[str],
    min_price: float = None,
    max_price: float = None,
    category: str = None
) -> List[Dict]:
```
- **Purpose**: Fetch products by ASINs with optional filters
- **Dynamic SQL building**:
```sql
SELECT ... FROM products 
WHERE asin IN (...)
  AND price >= min_price    -- if provided
  AND price <= max_price    -- if provided
  AND super_category = cat  -- if provided
```

#### Method: `get_categories()`
```python
def get_categories(self) -> List[str]:
```
- **Purpose**: Get unique product categories
- **SQL**: `SELECT DISTINCT super_category FROM products`
- **Returns**: List of 10 categories

#### Method: `get_stats()`
```python
def get_stats(self) -> Dict[str, Any]:
```
- **Purpose**: Get aggregate statistics
- **SQL**:
```sql
SELECT 
    COUNT(*) as total_products,
    AVG(price) as avg_price,
    AVG(stars) as avg_rating,
    COUNT(DISTINCT super_category) as categories
FROM products
```
- **Returns**: `{"total_products": 837291, "avg_price": 62.17, "avg_rating": 4.36, "categories": 10}`

---

## File: `engine.py`

The core search engine implementing your algorithm.

### Class: `SearchEngine`

#### Attributes
```python
self.stemmer       # PorterStemmer for word normalization
self.tfidf         # TF-IDF vectorizer from pickle
self.search_model  # KNN model for nearest neighbor search
self.kmeans        # KMeans model for clustering
self.product_asins # List of ASINs mapping indices to products
self.is_loaded     # Boolean flag for engine status
```

#### Method: `load(pkl_path)`
```python
def load(self, pkl_path: str = MODEL_PATH) -> bool:
```
**Purpose**: Initialize the search engine

**Process**:
1. Connect to MySQL database
2. Verify products exist in database
3. Load pickle file containing:
   - `vectorizer` → TF-IDF vectorizer
   - `search_model` → KNN model
   - `kmeans_model` → KMeans clustering model
   - `data` → DataFrame with ASIN mapping
4. Extract ASIN list for index-to-product mapping

#### Method: `clean_text(text)`
```python
def clean_text(self, text: str) -> str:
```
**Purpose**: Normalize search query same as training data

**Process**:
```python
text = str(text).lower()                    # "Wireless Headphones" → "wireless headphones"
text = re.sub(r'[^a-z0-9\s]', '', text)    # Remove punctuation
text = " ".join([stemmer.stem(w) for w in text.split()])  # "running" → "run"
```

#### Method: `get_trending_products(n, reason)`
```python
def get_trending_products(self, n: int = 5, reason: str = "Trending Fallback") -> List[Dict]:
```
**Purpose**: Fallback when search fails

**Formula**: `trending_score = stars × log(reviews + 1)`

**Used when**:
- Empty query
- Unknown words (OOV)
- Low similarity (< 5%)
- Filters eliminate all results

---

## Method: `search()` - The Core Algorithm

```python
def search(
    self,
    query: str,
    top_k: int = 10,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    category: Optional[str] = None
) -> List[Dict]:
```

### STAGE 1: INPUT VALIDATION (Lines 109-119)

```python
# Check for empty query
if not query:
    return self.get_trending_products(top_k, reason="Empty Query")

# Clean and vectorize the query
clean_q = self.clean_text(query)      # "Bluetooth speaker" → "bluetooth speaker"
query_vec = self.tfidf.transform([clean_q])  # Convert to TF-IDF vector

# CHECK A: Out-of-Vocabulary (OOV)
# If query contains only unknown words, vector sum is 0
if query_vec.sum() == 0:
    # Example: User types "xyzabc" which isn't in vocabulary
    return self.get_trending_products(top_k, reason="Unknown Words")
```

### STAGE 2: RETRIEVAL & SAFETY GATING (Lines 121-139)

```python
# Retrieve 500 nearest neighbors (candidates)
n_neighbors = min(500, len(self.product_asins))
distances, indices = self.search_model.kneighbors(query_vec, n_neighbors=n_neighbors)

# Build ASIN → similarity mapping
# Formula: similarity = (1 - distance) × 100
# KNN returns cosine distance (0=identical, 1=opposite)
matching_asins = [self.product_asins[i] for i in indices[0]]
similarity_scores = {
    asin: (1 - dist) * 100 
    for asin, dist in zip(matching_asins, distances[0])
}

# CHECK B: Similarity Gate
# If best match < 5% similar, search failed
max_sim = max(similarity_scores.values())
if max_sim < 5.0:
    # Example: Searching "diapers" but only electronics in DB
    return self.get_trending_products(top_k, reason="Low Relevance")

# Filter out noise (keep only > 5% similarity)
filtered_asins = [asin for asin, sim in similarity_scores.items() if sim > 5.0]
```

### STAGE 3: FETCH FROM MySQL WITH FILTERS (Lines 141-150)

```python
# Fetch actual product data from database (with filters applied)
products = db.search_products_with_filters(
    asins=filtered_asins,   # Only products matching TF-IDF
    min_price=min_price,    # Optional: filter by min price
    max_price=max_price,    # Optional: filter by max price
    category=category       # Optional: filter by category
)

# If filters removed all results, fallback to trending
if not products:
    return self.get_trending_products(top_k, reason="No matches after filters")
```

### STAGE 4: CLUSTER INTELLIGENCE (Lines 152-180)

```python
# Predict which cluster the query belongs to
predicted_cluster = None
if self.kmeans is not None:
    predicted_cluster = self.kmeans.predict(query_vec)[0]
    # Example: "headphones" → Cluster 5 (Electronics)

# For each product, apply cluster boost
for i, p in enumerate(products):
    similarity = similarity_scores.get(p['asin'], 0)
    
    # Boost if product is in predicted cluster
    cluster_multiplier = 1.0
    if predicted_cluster is not None and p.get('cluster_id') == predicted_cluster:
        cluster_multiplier = 1.5  # 50% boost!
    
    boosted_sim = similarity * cluster_multiplier
```

**Why Cluster Boost?**
- If you search "headphones", items in the headphones cluster get boosted
- This helps relevant items rank higher than coincidental text matches
- Soft filter: items from other clusters still appear, just ranked lower

### STAGE 5: FINAL SCORING (Lines 182-196)

```python
# Calculate rank percentiles for stars and reviews
star_ranks = pd.Series(all_stars).rank(pct=True).tolist()   # 0.0 to 1.0
rev_ranks = pd.Series(all_reviews).rank(pct=True).tolist()  # 0.0 to 1.0

# Formula: 60% Text Match + 20% Stars + 20% Reviews
final_score = (
    (boosted_sim * 0.6) +           # 60% weight: text similarity
    (star_ranks[i] * 100 * 0.2) +   # 20% weight: star rating rank
    (rev_ranks[i] * 100 * 0.2)      # 20% weight: review count rank
)

# Sort by final score descending
scored_products.sort(key=lambda x: x['final_score'], reverse=True)
return scored_products[:top_k]
```

**Why This Formula?**
- Text match (60%): Most important - find relevant products
- Stars (20%): Quality signal - prefer highly rated items
- Reviews (20%): Popularity signal - prefer proven items

---

## File: `main.py`

FastAPI application with all endpoints.

### Lifespan Handler
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load engine
    engine.load()
    yield
    # Shutdown: Disconnect database
    db.disconnect()
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check with status |
| `/health` | GET | Detailed health check |
| `/stats` | GET | Database statistics |
| `/search` | GET | Main search endpoint |
| `/trending` | GET | Get trending products |
| `/categories` | GET | List all categories |
| `/products/{id}` | GET | Get single product |
| `/products` | GET | List products with limit |

### Search Endpoint Parameters
```python
@app.get("/search")
async def search(
    q: str,                      # Required: search query
    top_k: int = 10,             # Number of results (1-100)
    min_price: float = None,     # Optional: minimum price
    max_price: float = None,     # Optional: maximum price
    category: str = None         # Optional: category filter
):
```

---

## File: `migrate_to_mysql.py`

One-time script to load pickle data into MySQL.

**Process**:
1. Load pickle file (837,291 products)
2. Create database if not exists
3. Create products table with indexes
4. Batch insert in groups of 500
5. Verify migration

---

## Database Schema

```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    asin VARCHAR(50) UNIQUE NOT NULL,    -- Amazon product ID
    title TEXT,                           -- Product name
    imgUrl TEXT,                          -- Image URL
    stars DECIMAL(3, 2),                  -- Rating (0.00-5.00)
    reviews INT,                          -- Review count
    price DECIMAL(10, 2),                 -- Price in USD
    categoryName VARCHAR(255),            -- Full category path
    isBestSeller BOOLEAN,                 -- Bestseller flag
    super_category VARCHAR(255),          -- Top-level category
    clean_title TEXT,                     -- Cleaned title for search
    cluster_id INT,                       -- KMeans cluster assignment
    
    INDEX idx_asin (asin),
    INDEX idx_category (super_category),
    INDEX idx_price (price),
    INDEX idx_stars (stars),
    INDEX idx_cluster (cluster_id)
);
```

---

## API Response Examples

### Search Response
```json
{
  "products": [
    {
      "asin": "B08GFW5MV1",
      "title": "BoYata Laptop Stand...",
      "price": 41.99,
      "stars": 4.8,
      "reviews": 13556,
      "category": "Electronics & Computers",
      "image": "https://...",
      "similarity": 73.43,
      "final_score": 104.1,
      "match_type": "Direct Search"
    }
  ],
  "count": 10,
  "query": "laptop stand",
  "match_type": "Direct Search"
}
```

### Trending Response
```json
{
  "products": [...],
  "count": 5,
  "reason": "Trending Request"
}
```

### Stats Response
```json
{
  "total_products": 837291,
  "avg_price": 62.17,
  "avg_rating": 4.36,
  "categories": 10
}
```
