// Navbar.jsx
import { useState, useEffect } from 'react';
import { FiHome } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import productService from '../services/productService'; // IMPORT AJOUTÉ

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);

  // Charger les catégories depuis le service
  useEffect(() => {
    // Utiliser les catégories du service ou définir des catégories par défaut
    const categories = productService.CONSTANTS?.AVAILABLE_CATEGORIES || [
      "All Categories",
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Beauty & Health",
      "Sports & Outdoors",
      "Automotive",
      "Toys & Baby",
      "Food & Grocery"
    ];
    
    setAvailableCategories(categories);
    console.log('Categories loaded in Navbar:', categories);
  }, []);

  // Déterminer la catégorie active depuis l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const categoryFromUrl = queryParams.get('category');
    
    console.log('URL Category param:', categoryFromUrl);
    console.log('Current pathname:', location.pathname);
    
    if (categoryFromUrl) {
      const decodedCategory = decodeURIComponent(categoryFromUrl);
      console.log('Decoded category:', decodedCategory);
      
      // Recherche insensible à la casse
      const foundCategory = availableCategories.find(
        cat => cat.toLowerCase() === decodedCategory.toLowerCase()
      );
      
      if (foundCategory) {
        setActiveCategory(foundCategory);
        console.log('Active category set to:', foundCategory);
      } else {
        console.log('Category not found in available categories');
        setActiveCategory('All Categories');
      }
    } else if (location.pathname === '/') {
      setActiveCategory(null);
    } else if (location.pathname === '/products') {
      setActiveCategory('All Categories');
    }
  }, [location, availableCategories]);

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    
    if (category === 'All Categories') {
      navigate('/products');
    } else {
      navigate(`/products?category=${encodeURIComponent(category)}`);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCategoryActive = (categoryName) => {
    return activeCategory === categoryName;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide py-2">
          {/* HOME */}
          <button
            onClick={handleHomeClick}
            className={`px-4 py-3 text-sm font-medium transition-all flex items-center gap-2 flex-shrink-0 ${
              location.pathname === '/' 
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <FiHome className="w-4 h-4" />
            Home
          </button>

          {/* All Categories */}
          <button
            onClick={() => handleCategoryClick('All Categories')}
            className={`px-4 py-3 text-sm font-medium transition-all flex-shrink-0 ${
              isCategoryActive('All Categories')
                ? 'text-black border-b-2 border-black' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            All Categories
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-gray-300 mx-2 flex-shrink-0"></div>

          {/* Categories dynamiques */}
          {availableCategories
            .filter(cat => cat !== 'All Categories') // Exclure "All Categories" qui est déjà affiché
            .map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-3 text-sm font-medium transition-all flex-shrink-0 whitespace-nowrap ${
                  isCategoryActive(category)
                    ? 'text-black border-b-2 border-black' 
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {category}
              </button>
            ))}
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;