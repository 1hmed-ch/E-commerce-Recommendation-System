// src/components/Products/ProductsDisplay.jsx
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductItem from "../ProductItem";

function ProductsDisplay({ 
  products, 
  viewMode, 
  isAuthenticated, 
  isAddingToCart, 
  onAddToCart, 
  onViewDetails,
  currentPage,
  totalPages,
  onPageChange 
}) {
  const ProductGrid = () => (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            isAddingToCart={isAddingToCart[product.id]}
            showQuickAdd={true}
            showDescription={true}
            size="default"
            showViewButton={true}
            requireAuth={!isAuthenticated}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );

  const ProductList = () => (
    <div className="space-y-6">
      {products.map((product) => (
        <ProductItem
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAddingToCart={isAddingToCart[product.id]}
          showQuickAdd={false}
          showDescription={true}
          size="large"
          showViewButton={true}
          requireAuth={!isAuthenticated}
          onViewDetails={onViewDetails}
          viewMode="list"
        />
      ))}
    </div>
  );

  const Pagination = () => totalPages > 1 && (
    <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-200/50">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <FiChevronLeft className="w-4 h-4" />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
          .map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${
                currentPage === page
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Next
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      {viewMode === "grid" ? <ProductGrid /> : <ProductList />}
      <Pagination />
    </>
  );
}

export default ProductsDisplay;