// src/pages/CartPage/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../../services/cartService";
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Charger le panier
  const loadCart = async () => {
    setLoading(true);
    try {
      const result = await cartService.getCart();
      
      if (result.success) {
        setCartItems(result.items);
        setTotal(result.total);
        setCartCount(result.count);
      } else {
        setCartItems([]);
        setTotal(0);
        setCartCount(0);
      }
    } catch (error) {
      console.error("Erreur chargement panier:", error);
      setCartItems([]);
      setTotal(0);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Supprimer un article
  const handleRemoveItem = async (item) => {
    if (!item.orderId) {
      console.error("Impossible de supprimer : orderId manquant", item);
      return;
    }

    try {
      const result = await cartService.removeFromCart(item.orderId);
      
      if (result.success) {
        // Recharger le panier
        await loadCart();
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Vider le panier
  const handleClearCart = async () => {
    if (window.confirm("Voulez-vous vraiment vider votre panier ?")) {
      try {
        const result = await cartService.clearCart();
        
        if (result.success) {
          await loadCart();
        } else {
          alert(`Erreur: ${result.message}`);
        }
      } catch (error) {
        console.error("Erreur vidage panier:", error);
        alert("Erreur lors du vidage du panier");
      }
    }
  };

  // Passer commande
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    try {
      const result = await cartService.checkout();
      
      if (result.success) {
        alert("Commande passée avec succès !");
        navigate("/orders"); // Rediriger vers la page des commandes
      } else {
        alert(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error("Erreur checkout:", error);
      alert("Erreur lors du paiement");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-8"
          >
            <FiArrowLeft />
            <span>Continuer vos achats</span>
          </button>

          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <FiShoppingBag className="text-gray-400 text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-black mb-3">Votre panier est vide</h1>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et commencez vos achats
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Voir les produits
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 mt-16">
          <h1 className="text-3xl font-serif font-light text-black mb-2">
            Votre Panier
          </h1>
          <p className="text-gray-600">
            {cartCount} article{cartCount > 1 ? 's' : ''} dans votre panier
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Liste des articles */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {cartItems.map((item) => (
                <div
                  key={`${item.orderId}-${item.productId}`}
                  className="flex flex-col md:flex-row items-center gap-6 p-6 border-b border-gray-100 last:border-b-0"
                >
                  {/* Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || "https://via.placeholder.com/300"}
                      alt={item.product?.name || item.productName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-black mb-2">
                      {item.product?.name || item.productName}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">
                      {item.product?.category || ""}
                    </p>
                    <p className="text-black font-bold">
                      ${(item.price || 0).toFixed(2)} × {item.quantity || 1}
                    </p>
                  </div>

                  {/* Prix et actions */}
                  <div className="flex flex-col items-end gap-4">
                    <span className="text-xl font-bold text-black">
                      ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item)}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      <FiTrash2 />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Bouton vider panier */}
              <div className="p-6 border-t border-gray-100">
                <button
                  onClick={handleClearCart}
                  className="text-gray-500 hover:text-red-600 text-sm"
                >
                  Vider le panier
                </button>
              </div>
            </div>

            {/* Bouton retour */}
            <button
              onClick={() => navigate("/products")}
              className="mt-6 flex items-center gap-2 text-gray-600 hover:text-black"
            >
              <FiArrowLeft />
              <span>Continuer vos achats</span>
            </button>
          </div>

          {/* Récapitulatif */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32">
              <h2 className="text-xl font-medium text-black mb-6">
                Récapitulatif
              </h2>

              {/* Sous-total */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between text-lg font-bold text-black">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Bouton commander */}
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors mb-4"
              >
                Passer la commande
              </button>

              <p className="text-xs text-gray-500 text-center">
                Livraison gratuite sur toutes les commandes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;