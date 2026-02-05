// src/components/Products.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import ProductItem from "../ProductItem";
import {
  FiFilter,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiShoppingCart,
  FiSearch
} from "react-icons/fi";
import { TbGridDots } from "react-icons/tb";
import productService from "../../services/productService";

// Utiliser les constantes du service
const {
  PRODUCTS_PER_PAGE,
  AVAILABLE_CATEGORIES,
  PRICE_RANGES,
  SORT_OPTIONS
} = productService.CONSTANTS;

// Définir les fonctions de tri une fois
const SORT_FUNCTIONS = {
  "price-low": (a, b) => a.price - b.price,
  "price-high": (a, b) => b.price - a.price,
  "name": (a, b) => a.name.localeCompare(b.name),
  "newest": (a, b) => (b.id || 0) - (a.id || 0),
  "rating": (a, b) => (b.rating || 0) - (a.rating || 0),
  "discount": (a, b) => (b.discount || 0) - (a.discount || 0),
  "featured": (a, b) => (b.rating || 0) - (a.rating || 0),
};

function Products() {
  const { isAuthenticated, openAuthModal, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // États simplifiés - un seul état pour les produits
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Récupérer le paramètre de catégorie depuis l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category');

    if (categoryFromUrl && AVAILABLE_CATEGORIES.includes(decodeURIComponent(categoryFromUrl))) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    }
  }, [location.search]);

  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Charger les données avec le service
  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      // Pass currentPage - 1 because backend pagination is usually 0-indexed
      let result;
      if (selectedCategory === "All Categories") {
        result = await productService.getAllProducts(currentPage - 1, PRODUCTS_PER_PAGE);
      } else {
        result = await productService.getProductsByCategory(selectedCategory, currentPage - 1, PRODUCTS_PER_PAGE);
      }

      if (result.success) {
        setProducts(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalProducts(result.pagination.totalElements);
        } else {
          // Fallback
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.error("Erreur chargement produits", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory]);

  // Initial load & Page change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recherche de produits
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1); // Reset to first page
      // loadData will be triggered by useEffect due to currentPage change if it changed, 
      // but if we are already at 1, we might need to force reload.
      if (currentPage === 1) loadData();
      return;
    }

    setLoading(true);
    try {
      const result = await productService.searchProducts(searchQuery, {
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        category: selectedCategory !== "All Categories" ? selectedCategory : undefined
      });

      if (result.success) {
        setProducts(result.data);
        // Search usually returns all matches or specific top K, so we might disable pagination or handle it differently
        // For now, assume search returns a list without pagination metadata
        setTotalPages(1);
        setTotalProducts(result.data.length);
        setSelectedCategory("All Categories");
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadData, currentPage]);

  // Appliquer les filtres avec useMemo pour l'optimisation
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Note: With backend pagination, filtering locally only filters the *current page*.
    // Ideally, filters should also be passed to backend. 
    // For now, we keep local filtering on the fetched page, but be aware of limitation.

    // Filtre par catégorie
    if (selectedCategory && selectedCategory !== "All Categories") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtre par prix
    filtered = filtered.filter(product =>
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Tri
    if (SORT_FUNCTIONS[sortBy]) {
      filtered.sort(SORT_FUNCTIONS[sortBy]);
    }

    return filtered;
  }, [products, selectedCategory, priceRange, sortBy]);

  // Products to display are just the filtered ones from the current page content
  const currentProducts = filteredAndSortedProducts;

  const handleAddToCart = useCallback(async (product) => {
    // Si pas authentifié, ouvrir le modal d'authentification
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));

    try {
      // Simuler l'ajout au panier
      console.log('Added to cart:', product.name);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Notification
      alert(`✅ ${product.name} ajouté au panier !`);

    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('❌ Erreur lors de l\'ajout au panier');
    } finally {
      setTimeout(() => {
        setIsAddingToCart(prev => ({ ...prev, [product.id]: false }));
      }, 1000);
    }
  }, [isAuthenticated, openAuthModal]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Réinitialiser la page

    // Reset filters to ensure we see products
    setPriceRange({ min: 0, max: 1000 });
    setSearchQuery("");

    if (category === "All Categories") {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  }, [navigate]);

  const handlePriceRangeChange = useCallback((min, max) => {
    setPriceRange({ min, max });
    setCurrentPage(1); // Réinitialiser la page
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory("All Categories");
    setPriceRange({ min: 0, max: 1000 });
    setSortBy("featured");
    setSearchQuery("");
    setCurrentPage(1);
    navigate('/products');
  }, [navigate]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewDetails = useCallback((product) => {
    navigate(`/product/${product.id}`);
  }, [navigate]);

  // Composant réutilisable pour les boutons de catégories
  const CategoryButtons = ({ categories, isMobile = false }) => (
    <div className={isMobile ? "grid grid-cols-2 gap-3" : "space-y-2"}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => {
            handleCategoryChange(category);
            if (isMobile) setShowFilters(false);
          }}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${selectedCategory === category
            ? "bg-black text-white"
            : "text-gray-700 hover:bg-gray-100"
            } ${isMobile ? "text-sm" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );

  // Composant réutilisable pour le range de prix
  const PriceRangeSlider = ({ isMobile = false }) => (
    <div className="space-y-6">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Min: {productService.formatPrice(priceRange.min)}</span>
        <span>Max: {productService.formatPrice(priceRange.max)}</span>
      </div>
      <div className={`relative ${isMobile ? "py-4" : "py-2"}`}>
        <input
          type="range"
          min="0"
          max="1000"
          step="10"
          value={priceRange.max}
          onChange={(e) => {
            handlePriceRangeChange(0, parseInt(e.target.value));
            if (isMobile) setCurrentPage(1);
          }}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 animate-pulse">
            <div className="h-12 bg-gray-200 rounded-2xl w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
          </div>

          <div className="flex gap-8">
            <div className="hidden lg:block w-64">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (filteredAndSortedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                <FiSearch className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-serif font-light text-black mb-3">
                No products found
              </h3>
              <p className="text-gray-600 mb-8 font-light">
                Try adjusting your filters or search terms
              </p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-black to-gray-800 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <FiFilter className="w-5 h-5" />
                Clear all filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header avec recherche */}
          <div className="mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-gray-50/50 backdrop-blur-sm rounded-2xl -z-10"></div>
            <div className="p-8">
              <h1 className="text-4xl md:text-5xl font-serif font-light text-black tracking-tight mb-6">
                {selectedCategory === "All Categories" ? "Our Collection" : selectedCategory}
              </h1>

              {isAuthenticated && user && (
                <p className="text-gray-600 mb-4 text-sm">
                  Welcome back, <span className="font-medium text-black">{user.firstName || user.email || 'User'}</span>
                </p>
              )}

              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search products by name, category, description..."
                    className="w-full px-6 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <FiSearch
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={handleSearch}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <FiSearch className="w-4 h-4" />
                  Search
                </button>
              </div>

              <p className="text-gray-600 text-base font-light">
                {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
                {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="lg:w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-40 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiFilter className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-black">Filters</h3>
                  </div>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                {/* Catégories */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Categories</h4>
                  <CategoryButtons categories={AVAILABLE_CATEGORIES} />
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Price Range</h4>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {PRICE_RANGES.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => handlePriceRangeChange(range.min, range.max)}
                          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${priceRange.min === range.min && priceRange.max === range.max
                            ? "bg-gray-100 text-black"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                    <PriceRangeSlider />
                  </div>
                </div>

                {/* User Status */}
                <div className="pt-6 border-t border-gray-200/50">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                      {isAuthenticated ? (
                        <span className="text-green-600 font-medium">✓ Signed in</span>
                      ) : (
                        <span className="text-yellow-600">🔒 Sign in to add to cart</span>
                      )}
                    </div>
                    {!isAuthenticated && (
                      <button
                        onClick={openAuthModal}
                        className="mt-2 w-full px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  🔒 <strong>Sign in required</strong> - Please sign in to add items to your cart
                </div>
              )}

              {/* Filters Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm mb-10 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                  {/* Mobile Filters Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-xl text-gray-700 hover:shadow-md transition-all duration-300"
                  >
                    <TbGridDots className="w-5 h-5" />
                    <span className="font-medium">Filters</span>
                    {showFilters && <FiX className="ml-2" />}
                  </button>

                  <div className="text-base font-medium text-gray-700 px-4 py-2 bg-gray-100/50 rounded-lg">
                    Showing <span className="text-black font-semibold">{
                      (currentPage - 1) * PRODUCTS_PER_PAGE + 1
                    }-{
                        Math.min(currentPage * PRODUCTS_PER_PAGE, filteredAndSortedProducts.length)
                      }</span> of <span className="text-black font-semibold">{filteredAndSortedProducts.length}</span> products
                  </div>

                  <div className="flex items-center gap-4">
                    {/* View Mode */}
                    <div className="hidden sm:flex items-center gap-1 bg-gray-100/50 rounded-xl p-1 border border-gray-200">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-3 rounded-lg transition-all duration-300 ${viewMode === "grid"
                          ? "bg-white shadow-md text-black"
                          : "text-gray-600 hover:bg-white/50"
                          }`}
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-3 rounded-lg transition-all duration-300 ${viewMode === "list"
                          ? "bg-white shadow-md text-black"
                          : "text-gray-600 hover:bg-white/50"
                          }`}
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative group">
                      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl pl-5 pr-12 py-3 text-sm hover:border-black transition-all duration-300 cursor-pointer min-w-[180px]">
                        <span className="text-gray-700">Sort by:</span>
                        <span className="font-medium text-black">
                          {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || "Featured"}
                        </span>
                        <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mobile Filters */}
                {showFilters && (
                  <div className="lg:hidden border-t border-gray-200/50 p-6 space-y-6 bg-white/90">
                    <div>
                      <h3 className="text-lg font-medium text-black mb-4">Categories</h3>
                      <CategoryButtons categories={AVAILABLE_CATEGORIES} isMobile />
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-black mb-4">Price Range</h3>
                      <PriceRangeSlider isMobile />
                    </div>
                  </div>
                )}
              </div>

              {/* Products Content */}
              {viewMode === "grid" ? (
                <>
                  <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {currentProducts.map((product) => (
                        <ProductItem
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          isAddingToCart={isAddingToCart[product.id]}
                          showQuickAdd={true}
                          showDescription={true}
                          size="default"
                          showViewButton={true}
                          requireAuth={!isAuthenticated}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-200/50">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        <FiChevronLeft className="w-4 h-4" />
                        Prev
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .slice(
                            Math.max(0, currentPage - 2),
                            Math.min(totalPages, currentPage + 1)
                          )
                          .map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${currentPage === page
                                ? 'bg-black text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                              {page}
                            </button>
                          ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Next
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // List View - Utilise ProductItem au lieu de dupliquer le code
                <div className="space-y-6">
                  {currentProducts.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      isAddingToCart={isAddingToCart[product.id]}
                      showQuickAdd={false}
                      showDescription={true}
                      size="large"
                      showViewButton={true}
                      requireAuth={!isAuthenticated}
                      onViewDetails={handleViewDetails}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Products;