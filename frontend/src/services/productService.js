// services/productService.js
const API_BASE_URL = "http://localhost:8080/api";

// Fonction de formatage adaptée à l'entité backend
const formatProducts = (products) => {
  if (!products || !Array.isArray(products)) return [];

  return products.map(product => {
    // Convertir BigDecimal price en number
    const price = product.price ? Number(product.price) : 0;

    return {
      // Champs provenant directement du backend
      id: product.id,
      name: product.name || 'No Name',
      description: product.description || '',
      price: price,
      category: product.category || 'Uncategorized',
      imageUrl: product.imageUrl ||
        `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80`,
      brand: product.brand || 'Generic',
      stockQuantity: product.stockQuantity || 0,
      available: product.available !== undefined ? product.available : true,

      // Champs calculés pour le frontend (non présents dans le backend)
      originalPrice: null, // Non présent dans l'entité
      discount: 0, // Calculé si nécessaire
      rating: 4.0, // Valeur par défaut
      reviewCount: 0, // Valeur par défaut
      shipping: "Free Shipping", // Valeur par défaut
      tags: [] // Valeur par défaut
    };
  });
};

// Fonction pour créer un produit (create)
const createProduct = async (productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: productData.imageUrl,
        brand: productData.brand,
        stockQuantity: productData.stockQuantity,
        available: productData.available !== undefined ? productData.available : true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();

    if (apiResponse.success && apiResponse.data) {
      return {
        success: true,
        data: formatProducts([apiResponse.data])[0],
        message: 'Product created successfully'
      };
    } else {
      throw new Error(apiResponse.message || 'Failed to create product');
    }

  } catch (error) {
    console.error('❌ Error creating product:', error);
    return {
      success: false,
      data: null,
      message: `Error: ${error.message}`
    };
  }
};

// Fonction pour mettre à jour un produit (update)
const updateProduct = async (productId, productData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        imageUrl: productData.imageUrl,
        brand: productData.brand,
        stockQuantity: productData.stockQuantity,
        available: productData.available
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();

    if (apiResponse.success && apiResponse.data) {
      return {
        success: true,
        data: formatProducts([apiResponse.data])[0],
        message: 'Product updated successfully'
      };
    } else {
      throw new Error(apiResponse.message || 'Failed to update product');
    }

  } catch (error) {
    console.error('❌ Error updating product:', error);
    return {
      success: false,
      data: null,
      message: `Error: ${error.message}`
    };
  }
};

// Fonction pour supprimer un produit (delete)
const deleteProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const apiResponse = await response.json();

    return {
      success: apiResponse.success || false,
      message: apiResponse.message || 'Product deleted successfully'
    };

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
};

const productService = {
  // Constantes pour le frontend
  CONSTANTS: {
    PRODUCTS_PER_PAGE: 12,
    AVAILABLE_CATEGORIES: [
      "All Categories",
      "Home, Kitchen & Garden",
      "Electronics & Computers",
      "Beauty, Health & Personal Care",
      "Women's Fashion",
      "Toys, Kids & Baby",
      "Automotive & Industrial",
      "Sports & Outdoors",
      "Men's Fashion",
      "Tools & Home Improvement",
      "Food & Grocery"

    ],
    PRICE_RANGES: [
      { label: "Under $50", min: 0, max: 50 },
      { label: "$50-100", min: 50, max: 100 },
      { label: "$100-200", min: 100, max: 200 },
      { label: "$200-500", min: 200, max: 500 },
      { label: "Over $500", min: 500, max: 10000 }
    ],
    SORT_OPTIONS: [
      { value: "featured", label: "Featured" },
      { value: "price-low", label: "Price: Low to High" },
      { value: "price-high", label: "Price: High to Low" },
      { value: "name", label: "Name: A-Z" },
      { value: "newest", label: "Newest" },
      { value: "rating", label: "Highest Rated" },
      { value: "discount", label: "Best Discount" }
    ]
  },

  // CRUD Operations

  // CREATE
  createProduct,

  // READ
  getAllProducts: async (page = 0, size = 12) => {
    try {
      console.log('🔄 Fetching products from:', `${API_BASE_URL}/products?page=${page}&size=${size}`);

      const response = await fetch(`${API_BASE_URL}/products?page=${page}&size=${size}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server response not OK:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      // Handle the new PaginatedResponse structure: { success: true, data: { data: [...], totalElements: 100, ... } }
      // Or if wrapped in generic ApiResponse: { success: true, data: { data: [...], ... } }

      if (apiResponse.success && apiResponse.data) {
        // Check if data is paginated (has 'data' field which is an array, and 'totalPages' etc.)
        let products = [];
        let paginationInfo = {};

        if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
          products = apiResponse.data.data;
          paginationInfo = {
            totalPages: apiResponse.data.totalPages,
            totalElements: apiResponse.data.totalElements,
            currentPage: apiResponse.data.currentPage,
            pageSize: apiResponse.data.pageSize
          };
        } else if (Array.isArray(apiResponse.data)) {
          // Fallback for non-paginated endpoints or if backend structure differs
          products = apiResponse.data;
        }

        const formattedData = formatProducts(products);
        console.log('🔄 Formatted products:', formattedData.length);

        return {
          success: true,
          data: formattedData,
          pagination: paginationInfo,
          message: 'Products loaded successfully',
          fromBackend: true
        };
      } else {
        console.error('❌ API response format error:', apiResponse);
        throw new Error(apiResponse.message || 'Invalid response format');
      }

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        data: [],
        message: `Error: ${error.message}`,
        fromBackend: false
      };
    }
  },

  getProductById: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        return {
          success: true,
          data: formatProducts([apiResponse.data])[0],
          fromBackend: true
        };
      } else {
        throw new Error(apiResponse.message || 'Product not found');
      }

    } catch (error) {
      console.error('❌ Error fetching product:', error.message);
      return {
        success: false,
        data: null,
        fromBackend: false
      };
    }
  },

  // UPDATE
  updateProduct,

  // DELETE
  deleteProduct,

  // Rechercher des produits
  searchProducts: async (keyword, filters = {}) => {
    try {
      const { minPrice, maxPrice, category, topK } = filters;
      let url = `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`;

      if (minPrice !== undefined) url += `&minPrice=${minPrice}`;
      if (maxPrice !== undefined) url += `&maxPrice=${maxPrice}`;
      if (category && category !== "All Categories") url += `&category=${encodeURIComponent(category)}`;
      if (topK) url += `&topK=${topK}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        return {
          success: true,
          data: formatProducts(apiResponse.data),
          fromBackend: true
        };
      } else {
        return {
          success: true,
          data: [],
          fromBackend: true
        };
      }

    } catch (error) {
      console.error('❌ Error searching products:', error);
      return {
        success: false,
        data: [],
        fromBackend: false
      };
    }
  },

  // Récupérer les produits par catégorie
  getProductsByCategory: async (category, page = 0, size = 12) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/category/${encodeURIComponent(category)}?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        let products = [];
        let paginationInfo = {};

        if (apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
          products = apiResponse.data.data;
          paginationInfo = {
            totalPages: apiResponse.data.totalPages,
            totalElements: apiResponse.data.totalElements,
            currentPage: apiResponse.data.currentPage,
            pageSize: apiResponse.data.pageSize
          };
        } else if (Array.isArray(apiResponse.data)) {
          products = apiResponse.data;
        }

        return {
          success: true,
          data: formatProducts(products),
          pagination: paginationInfo,
          fromBackend: true
        };
      } else {
        throw new Error(apiResponse.message || 'No data received');
      }

    } catch (error) {
      console.error('❌ Error fetching products by category:', error.message);
      return {
        success: false,
        data: [],
        fromBackend: false
      };
    }
  },

  // Récupérer les recommandations
  getRecommendations: async (productId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/recommendations`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (apiResponse.success && apiResponse.data) {
        return {
          success: true,
          data: formatProducts(apiResponse.data),
          fromBackend: true
        };
      } else {
        return {
          success: false,
          data: [],
          fromBackend: true
        };
      }

    } catch (error) {
      console.error('❌ Error fetching recommendations:', error);
      return {
        success: false,
        data: [],
        fromBackend: false
      };
    }
  },

  // Opérations de filtrage côté client
  filterAndSortProducts: (products, filters) => {
    let result = [...products];

    const { category, priceRange, sortBy } = filters || {};

    // Filtre par catégorie
    if (category && category !== "All Categories") {
      result = result.filter(product => product.category === category);
    }

    // Filtre par prix
    if (priceRange) {
      result = result.filter(product =>
        product.price >= (priceRange.min || 0) &&
        product.price <= (priceRange.max || 10000)
      );
    }

    // Tri
    if (sortBy) {
      switch (sortBy) {
        case "price-low":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          result.sort((a, b) => b.price - a.price);
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
          // Utiliser l'ID comme proxy pour la date (les IDs plus grands sont plus récents)
          result.sort((a, b) => b.id - a.id);
          break;
        case "rating":
          result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "discount":
          result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
          break;
        default:
          // featured - tri par défaut par disponibilité puis par ID
          result.sort((a, b) => {
            if (a.available !== b.available) {
              return a.available ? -1 : 1;
            }
            return b.id - a.id;
          });
          break;
      }
    }

    return result;
  },

  // Pagination
  paginateProducts: (products, currentPage, productsPerPage = 12) => {
    if (!products || !Array.isArray(products)) {
      return {
        currentProducts: [],
        totalPages: 0,
        currentPage: 1,
        totalProducts: 0,
        startIndex: 0,
        endIndex: 0
      };
    }

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(products.length / productsPerPage);

    return {
      currentProducts,
      totalPages,
      currentPage,
      totalProducts: products.length,
      startIndex: indexOfFirstProduct + 1,
      endIndex: Math.min(indexOfLastProduct, products.length)
    };
  },

  // Formatter le prix
  formatPrice: (price) => {
    if (price === null || price === undefined) return '$0.00';

    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);

    if (isNaN(numPrice)) return '$0.00';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  },

  // Vérifier la disponibilité du stock
  getStockStatus: (stockQuantity, available = true) => {
    if (!available || stockQuantity <= 0) {
      return {
        status: 'out-of-stock',
        label: 'Out of Stock',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else if (stockQuantity <= 10) {
      return {
        status: 'low-stock',
        label: 'Low Stock',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200'
      };
    } else {
      return {
        status: 'in-stock',
        label: 'In Stock',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
  },

  // Obtenir toutes les catégories uniques
  getAllCategories: (products) => {
    if (!products || !Array.isArray(products)) {
      return ["All Categories"];
    }

    const categories = ["All Categories"];
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    return [...categories, ...uniqueCategories];
  },

  // Fonction utilitaire pour vérifier les endpoints
  checkBackendConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Backend is reachable'
        };
      }
      return {
        success: false,
        message: 'Backend is not responding'
      };
    } catch (error) {
      return {
        success: false,
        message: `Cannot connect to backend: ${error.message}`
      };
    }
  }
};

export default productService;