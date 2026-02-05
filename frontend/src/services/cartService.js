// src/services/cartService.js
import api from "../API/api";

export const cartService = {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  // Obtenir l'utilisateur connecté
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  // Récupérer le panier (avec gestion d'authentification)
  getCart: async () => {
    if (!cartService.isAuthenticated()) {
      return {
        success: false,
        items: [],
        total: 0,
        count: 0,
        requireAuth: true,
        error: "User not authenticated"
      };
    }

    try {
      const res = await api.get("/orders");
      const orders = res.data.data || [];

      const pendingOrders = orders.filter(order => order.status === "PENDING");
      const allItems = pendingOrders.flatMap(order =>
        order.items.map(item => ({ ...item, orderId: order.id }))
      );

      const itemsWithProduct = await Promise.all(
        allItems.map(async (item) => {
          try {
            const productRes = await api.get(`/products/${item.productId}`);
            return {
              ...item,
              product: productRes.data.data
            };
          } catch (err) {
            console.error(`Erreur récupération produit ${item.productId}`, err);
            return item;
          }
        })
      );

      const total = itemsWithProduct.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );

      return {
        success: true,
        items: itemsWithProduct,
        total,
        count: itemsWithProduct.length,
        requireAuth: false
      };

    } catch (err) {
      console.error("Erreur récupération panier :", err);
      return {
        success: false,
        items: [],
        total: 0,
        count: 0,
        requireAuth: false,
        error: err.message
      };
    }
  },

  // Ajouter au panier (avec vérification d'authentification)
  addToCart: async (productId, quantity = 1, onRequireAuth = null) => {
    if (!cartService.isAuthenticated()) {
      // Si un callback est fourni, l'appeler
      if (onRequireAuth && typeof onRequireAuth === 'function') {
        onRequireAuth();
      }
      return {
        success: false,
        requireAuth: true,
        message: "Authentication required"
      };
    }

    try {
      // Vérifier d'abord si le produit existe
      await api.get(`/products/${productId}`);

      // Créer une nouvelle commande PENDING
      const orderData = {
        status: "PENDING",
        items: [{
          productId,
          quantity,
          price: 0
        }]
      };

      const res = await api.post("/orders", orderData);
      
      return {
        success: true,
        requireAuth: false,
        message: "Produit ajouté au panier",
        data: res.data.data
      };

    } catch (err) {
      console.error("Erreur ajout au panier :", err);
      return {
        success: false,
        requireAuth: false,
        message: err.response?.data?.message || "Erreur lors de l'ajout au panier"
      };
    }
  },

  // Supprimer du panier
  removeFromCart: async (orderId) => {
    if (!cartService.isAuthenticated()) {
      return {
        success: false,
        requireAuth: true,
        message: "Authentication required"
      };
    }

    try {
      await api.post(`/orders/${orderId}/cancel`);
      
      return {
        success: true,
        requireAuth: false,
        message: "Produit retiré du panier"
      };

    } catch (err) {
      console.error("Erreur suppression du panier :", err);
      return {
        success: false,
        requireAuth: false,
        message: err.response?.data?.message || "Erreur lors de la suppression"
      };
    }
  }
};

export default cartService;