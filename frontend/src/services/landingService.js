// src/pages/LandingPage/services/landingService.js
const API_BASE_URL = "http://localhost:8080/api";

export const landingService = {
  // Tester la connexion au backend
  testBackendConnection: async () => {
    try {
      console.log(` Testing connection to: ${API_BASE_URL}/products`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(' Connected successfully! Data:', data);
        return { success: true, data };
      } else {
        console.warn(' Backend error:', response.status, response.statusText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (err) {
      console.error(' Connection failed:', err);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'Connection timeout' : err.message
      };
    }
  },

  // Charger les produits
  loadProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=0&size=8`, {
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

      if (apiResponse.success) {
        let products = [];
        // Handle PaginatedResponse: { data: { data: [...], ... } } vs List: { data: [...] }
        if (apiResponse.data && apiResponse.data.data && Array.isArray(apiResponse.data.data)) {
          products = apiResponse.data.data;
        } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
          products = apiResponse.data;
        }

        return {
          success: true,
          products: products,
          fromBackend: true
        };
      } else {
        throw new Error(apiResponse.message || 'Invalid response format');
      }

    } catch (error) {
      console.error(' Error loading products:', error);
      return {
        success: false,
        products: [],
        fromBackend: false,
        message: error.message
      };
    }
  },

  // Rechercher des produits
  searchProducts: async (keyword) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`,
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

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          products: data.data || [],
          fromBackend: true
        };
      } else {
        return {
          success: true,
          products: [],
          fromBackend: true
        };
      }

    } catch (error) {
      console.error(' Error searching products:', error);
      return {
        success: false,
        products: [],
        fromBackend: false
      };
    }
  }
};