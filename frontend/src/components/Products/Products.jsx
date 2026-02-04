// src/components/Products/products.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import ProductsHeader from "./ProductsHeader";
import ProductsFilters from "./ProductsFilters";
import ProductsToolbar from "./ProductsToolbar";
import ProductsDisplay from "./ProductsDisplay";
import productService from "../../services/productService";
import { FiFilter, FiSearch } from "react-icons/fi"; // IMPORT AJOUTÉ

// Constantes
const { 
  PRODUCTS_PER_PAGE, 
  AVAILABLE_CATEGORIES 
} = productService.CONSTANTS;

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
  
  // États
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

  // Initialisation depuis l'URL - AMÉLIORÉ
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category');
    
    if (categoryFromUrl) {
      const decodedCategory = decodeURIComponent(categoryFromUrl);
      
      // Log pour débogage
      console.log('Category from URL:', decodedCategory);
      console.log('Available categories:', AVAILABLE_CATEGORIES);
      
      // Recherche insensible à la casse
      const foundCategory = AVAILABLE_CATEGORIES.find(
        cat => cat.toLowerCase() === decodedCategory.toLowerCase()
      );
      
      if (foundCategory) {
        setSelectedCategory(foundCategory);
        console.log('Setting category to:', foundCategory);
      } else {
        console.log('Category not found in available categories');
        setSelectedCategory("All Categories");
      }
    } else {
      setSelectedCategory("All Categories");
    }
  }, [location.search]);

  // Chargement des données
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.getAllProducts();
      setProducts(result.data);
      
      // Log pour débogage des catégories disponibles dans les produits
      if (result.data && result.data.length > 0) {
        const uniqueCategories = [...new Set(result.data.map(p => p.category).filter(Boolean))];
        console.log('Unique categories in products:', uniqueCategories);
      }
    } catch (err) {
      console.error("Erreur chargement produits", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Recherche
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      loadData();
      setSelectedCategory("All Categories");
      setCurrentPage(1);
      navigate('/products');
      return;
    }

    setLoading(true);
    try {
      const result = await productService.searchProducts(searchQuery);
      
      if (result.success) {
        setProducts(result.data);
        setSelectedCategory("All Categories");
        setCurrentPage(1);
        navigate('/products');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, loadData, navigate]);

  // Produits filtrés et triés - CORRIGÉ
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    console.log('Filtering with category:', selectedCategory);
    console.log('Total products before filter:', filtered.length);

    if (selectedCategory && selectedCategory !== "All Categories") {
      filtered = filtered.filter(product => {
        if (!product.category) {
          console.log('Product has no category:', product.name);
          return false;
        }
        
        // Normalisation insensible à la casse
        const productCategory = product.category.toString().trim().toLowerCase();
        const selectedCategoryLower = selectedCategory.toString().trim().toLowerCase();
        
        const matches = productCategory === selectedCategoryLower;
        
        if (matches) {
          console.log('Product matches category:', product.name, '-', product.category);
        }
        
        return matches;
      });
    }

    console.log('Products after category filter:', filtered.length);

    // Filtre par prix
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price) || 0;
      const inRange = price >= priceRange.min && price <= priceRange.max;
      return inRange;
    });

    console.log('Products after price filter:', filtered.length);

    // Tri
    if (SORT_FUNCTIONS[sortBy]) {
      filtered.sort(SORT_FUNCTIONS[sortBy]);
    }

    console.log('Final filtered products count:', filtered.length);
    return filtered;
  }, [products, selectedCategory, priceRange, sortBy]);

  // Pagination
  const { 
    currentProducts, 
    totalPages 
  } = productService.paginateProducts(filteredAndSortedProducts, currentPage, PRODUCTS_PER_PAGE);

  // Handlers - CORRIGÉS
  const handleAddToCart = useCallback(async (product) => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    setIsAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      console.log('Added to cart:', product.name);
      await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log('Category change requested:', category);
    setSelectedCategory(category);
    setCurrentPage(1);
    setSearchQuery(""); // Réinitialiser la recherche
    
    if (category === "All Categories") {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
  }, [navigate]);

  const handlePriceRangeChange = useCallback((min, max) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
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

  const updateSearchQuery = useCallback((query) => {
    setSearchQuery(query);
  }, []);

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
                {selectedCategory !== "All Categories" 
                  ? `No products found in "${selectedCategory}". Try another category or clear filters.`
                  : "Try adjusting your filters or search terms"}
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
          <ProductsHeader 
            selectedCategory={selectedCategory}
            isAuthenticated={isAuthenticated}
            user={user}
            searchQuery={searchQuery}
            onSearchChange={updateSearchQuery}
            onSearch={handleSearch}
            totalProducts={filteredAndSortedProducts.length}
          />

          <div className="flex flex-col lg:flex-row gap-8">
            <ProductsFilters 
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              isAuthenticated={isAuthenticated}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={handleClearFilters}
              openAuthModal={openAuthModal}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            <div className="flex-1">
              {!isAuthenticated && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  🔒 <strong>Sign in required</strong> - Please sign in to add items to your cart
                </div>
              )}

              <ProductsToolbar 
                currentPage={currentPage}
                totalProducts={filteredAndSortedProducts.length}
                productsPerPage={PRODUCTS_PER_PAGE}
                sortBy={sortBy}
                viewMode={viewMode}
                showFilters={showFilters}
                onSortChange={setSortBy}
                onViewModeChange={setViewMode}
                onToggleFilters={() => setShowFilters(!showFilters)}
              />

              <ProductsDisplay 
                products={currentProducts}
                viewMode={viewMode}
                isAuthenticated={isAuthenticated}
                isAddingToCart={isAddingToCart}
                onAddToCart={handleAddToCart}
                onViewDetails={handleViewDetails}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Products;