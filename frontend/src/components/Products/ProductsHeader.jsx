// src/components/Products/ProductsHeader.jsx
import { FiSearch } from "react-icons/fi";

function ProductsHeader({ 
  selectedCategory, 
  isAuthenticated, 
  user, 
  searchQuery, 
  onSearchChange, 
  onSearch,
  totalProducts 
}) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Search products by name, category, description..."
              className="w-full px-6 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <FiSearch 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={onSearch}
            />
          </div>
          <button
            onClick={onSearch}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            Search
          </button>
        </div>
        
        <p className="text-gray-600 text-base font-light">
          {totalProducts} product{totalProducts !== 1 ? 's' : ''} found
          {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
        </p>
      </div>
    </div>
  );
}

export default ProductsHeader;