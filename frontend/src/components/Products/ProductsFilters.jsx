// src/components/Products/ProductsFilters.jsx
import { FiFilter, FiX } from "react-icons/fi";
import { TbGridDots } from "react-icons/tb";
import productService from "../../services/productService";

const { AVAILABLE_CATEGORIES, PRICE_RANGES } = productService.CONSTANTS;

function ProductsFilters({ 
  selectedCategory, 
  priceRange, 
  isAuthenticated, 
  onCategoryChange, 
  onPriceRangeChange, 
  onClearFilters,
  openAuthModal,
  showFilters,
  onToggleFilters 
}) {
  const CategoryButtons = ({ isMobile = false }) => (
    <div className={isMobile ? "grid grid-cols-2 gap-3" : "space-y-2"}>
      {AVAILABLE_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => {
            onCategoryChange(category);
            if (isMobile) onToggleFilters();
          }}
          className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 ${
            selectedCategory === category
              ? "bg-black text-white"
              : "text-gray-700 hover:bg-gray-100"
          } ${isMobile ? "text-sm" : ""}`}
        >
          {category}
        </button>
      ))}
    </div>
  );

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
            onPriceRangeChange(0, parseInt(e.target.value));
            if (isMobile) onToggleFilters();
          }}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filters Toggle */}
      <button
        onClick={onToggleFilters}
        className="lg:hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-xl text-gray-700 hover:shadow-md transition-all duration-300 mb-4"
      >
        <TbGridDots className="w-5 h-5" />
        <span className="font-medium">Filters</span>
        {showFilters && <FiX className="ml-2" />}
      </button>

      {/* Desktop Filters */}
      <div className="lg:w-64 flex-shrink-0 hidden lg:block">
        <div className="sticky top-40 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiFilter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-black">Filters</h3>
            </div>
            <button
              onClick={onClearFilters}
              className="text-sm text-gray-500 hover:text-black transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Categories</h4>
            <CategoryButtons />
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Price Range</h4>
            <div className="space-y-6">
              <div className="space-y-3">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => onPriceRangeChange(range.min, range.max)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 ${
                      priceRange.min === range.min && priceRange.max === range.max
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

      {/* Mobile Filters Dropdown */}
      {showFilters && (
        <div className="lg:hidden w-full mb-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-black mb-4">Categories</h3>
            <CategoryButtons isMobile />
          </div>

          <div>
            <h3 className="text-lg font-medium text-black mb-4">Price Range</h3>
            <PriceRangeSlider isMobile />
          </div>
        </div>
      )}
    </>
  );
}

export default ProductsFilters;