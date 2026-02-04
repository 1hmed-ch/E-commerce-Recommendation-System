// src/components/Products/ProductsToolbar.jsx
import { FiGrid, FiList, FiChevronDown, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { TbGridDots } from "react-icons/tb";
import productService from "../../services/productService";

const { SORT_OPTIONS } = productService.CONSTANTS;

function ProductsToolbar({ 
  currentPage, 
  totalProducts, 
  productsPerPage, 
  sortBy, 
  viewMode, 
  showFilters,
  onSortChange, 
  onViewModeChange,
  onToggleFilters 
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm mb-10 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
        {/* Mobile Filters Toggle */}
        <button
          onClick={onToggleFilters}
          className="lg:hidden flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-xl text-gray-700 hover:shadow-md transition-all duration-300"
        >
          <TbGridDots className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {showFilters && <FiX className="ml-2" />}
        </button>

        <div className="text-base font-medium text-gray-700 px-4 py-2 bg-gray-100/50 rounded-lg">
          Showing <span className="text-black font-semibold">{
            (currentPage - 1) * productsPerPage + 1
          }-{
            Math.min(currentPage * productsPerPage, totalProducts)
          }</span> of <span className="text-black font-semibold">{totalProducts}</span> products
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100/50 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === "grid" 
                  ? "bg-white shadow-md text-black" 
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <FiGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-3 rounded-lg transition-all duration-300 ${
                viewMode === "list" 
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
              onChange={(e) => onSortChange(e.target.value)}
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
    </div>
  );
}

export default ProductsToolbar;