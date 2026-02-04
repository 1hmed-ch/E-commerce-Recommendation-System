// src/pages/LandingPage/LandingPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // <-- IMPORT
import ProductItem from "../ProductItem";
import HeroCarousel from "./HeroCarousel";
import FeaturesSection from "./FeaturesSection";
import CategoriesSection from "./CategoriesSection";
import NewsletterSection from "./NewsletterSection";
import StatusBanner from "./StatusBanner";
import AuthPage from "../AuthPage/AuthPage"; // <-- IMPORT
import { landingService } from "../../services/landingService";
import cartService from "../../services/cartService";
import { FiArrowRight, FiSearch } from "react-icons/fi";

function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal, user } = useAuth(); // <-- USE AUTH
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [networkError, setNetworkError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [cartCount, setCartCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false); // <-- LOCAL STATE

  // Charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    setBackendStatus("checking");
    setNetworkError(null);

    console.log('🔄 Loading data from backend...');

    const connectionResult = await landingService.testBackendConnection();

    if (connectionResult.success) {
      setBackendStatus("connected");
      
      const productResult = await landingService.loadProducts();
      
      if (productResult.success) {
        setProducts(productResult.products);
      } else {
        setBackendStatus("disconnected");
        setNetworkError(productResult.message);
      }
      
    } else {
      setBackendStatus("disconnected");
      setNetworkError(connectionResult.error);
      setProducts([]);
    }

    setLoading(false);
  }, []);

  // Récupérer le nombre d'articles dans le panier
  const loadCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      const result = await cartService.getCart();
      if (result.success) {
        setCartCount(result.count);
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadData();
    loadCartCount();
  }, [loadData, loadCartCount]);

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = useCallback(async (product) => {
    if (!product.id) {
      console.error('Produit sans ID:', product);
      return;
    }

    // Si pas authentifié, ouvrir le modal d'authentification
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      // Fonction appelée si l'authentification est requise
      const onRequireAuth = () => {
        openAuthModal();
      };

      const result = await cartService.addToCart(product.id, 1, onRequireAuth);
      
      if (result.success) {
        // Mettre à jour le compteur
        const cartResult = await cartService.getCart();
        if (cartResult.success) {
          setCartCount(cartResult.count);
        }
        
        console.log('✅ Produit ajouté:', product.name);
        
        // Notification visuelle simple
        alert(`✅ ${product.name} ajouté au panier !`);
      } else if (result.requireAuth) {
        // Déjà géré par onRequireAuth
      } else {
        console.error('❌ Erreur ajout panier:', result.message);
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Erreur ajout panier:', error);
      alert('❌ Erreur lors de l\'ajout au panier');
    } finally {
      setTimeout(() => {
        setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
      }, 1000);
    }
  }, [isAuthenticated, openAuthModal]);

  // Recherche
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    setIsSearching(true);

    try {
      const result = await landingService.searchProducts(searchTerm);
      
      if (result.success) {
        setProducts(result.products);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
  };

  const handleShopNow = () => {
    navigate('/products');
  };

  const handleViewCart = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    navigate('/cart');
  };

  const handleUserAction = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      openAuthModal();
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-black rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">
            {backendStatus === "checking" ? "Connecting to backend..." : "Loading products..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <StatusBanner 
        status={backendStatus}
        networkError={networkError}
        onRetry={loadData}
      />

      {/* Modal d'authentification */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <AuthPage />
          </div>
        </div>
      )}

      <main className="pt-32">
        {/* Hero Carousel */}
        <HeroCarousel onShopNow={handleShopNow} />

        {/* Features */}
        <FeaturesSection />

        {/* Categories */}
        <CategoriesSection 
          onCategoryClick={handleCategoryClick}
          onViewAll={handleShopNow}
        />

        {/* Featured Products */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-black tracking-tight mb-2">
                  Featured Products
                </h2>
                <p className="text-gray-600 text-xs font-light">
                  {isAuthenticated 
                    ? `Welcome back, ${user?.firstName || user?.email || 'User'}!`
                    : "Sign in to add items to your cart"
                  }
                </p>
              </div>
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                {/* Bouton Panier avec compteur */}
                {isAuthenticated && cartCount > 0 && (
                  <button
                    onClick={handleViewCart}
                    className="relative px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors text-xs flex items-center gap-2"
                  >
                    <span>Panier</span>
                    <span className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {cartCount}
                    </span>
                  </button>
                )}
                
                {/* Bouton Connexion/Profil */}
                <button
                  onClick={handleUserAction}
                  className="px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors text-xs"
                >
                  {isAuthenticated ? 'My Profile' : 'Sign In'}
                </button>

                <button
                  onClick={handleShopNow}
                  className="text-black hover:text-gray-700 font-medium flex items-center space-x-1 group text-xs tracking-wide"
                >
                  <span>View All</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {isSearching ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black mb-3"></div>
                <p className="text-gray-600 text-xs">Searching products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FiSearch className="text-gray-400 text-xl" />
                </div>
                <h3 className="text-base font-medium text-black mb-2">
                  {backendStatus === "connected" ? "No products available" : "Cannot load products"}
                </h3>
                <p className="text-gray-600 mb-4 text-xs">
                  {backendStatus === "connected" 
                    ? "The catalog is currently empty" 
                    : "Please check your connection"}
                </p>
                <button
                  onClick={loadData}
                  className="px-5 py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors text-xs"
                >
                  {backendStatus === "connected" ? "Refresh" : "Retry Connection"}
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto">
                {/* Message d'authentification */}
                {!isAuthenticated && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    🔒 <strong>Sign in required</strong> - Please sign in to add items to your cart
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={isAddingToCart[product.id]}
                      showQuickAdd={true}
                      showDescription={true}
                      size="compact"
                      showViewButton={true}
                      requireAuth={!isAuthenticated} // <-- NOUVEAU PROP
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterSection />
      </main>
    </div>
  );
}

export default LandingPage;