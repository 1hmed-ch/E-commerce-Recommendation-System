// src/components/ProductItem.jsx
import { useState } from "react"
import { FiShoppingCart } from "react-icons/fi"
import { BsTag } from "react-icons/bs"
import { useNavigate } from "react-router-dom"

const ProductItem = ({ 
  product, 
  onAddToCart, 
  isAddingToCart,
  showQuickAdd = true,
  showDescription = true,
  showBrand = true,
  size = "default",
  showViewButton = true,
  onViewDetails,
  requireAuth = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  // Tailles différentes
  const sizeClasses = {
    default: {
      card: "rounded-lg",
      image: "aspect-square",
      title: "text-sm",
      price: "text-lg",
      padding: "p-3",
      button: "text-xs px-2 py-1"
    },
    compact: {
      card: "rounded-md",
      image: "aspect-square",
      title: "text-xs",
      price: "text-base",
      padding: "p-2",
      button: "text-xs px-1.5 py-0.5"
    },
    large: {
      card: "rounded-xl",
      image: "aspect-square",
      title: "text-base",
      price: "text-xl",
      padding: "p-4",
      button: "text-sm px-3 py-1.5"
    }
  }

  const currentSize = sizeClasses[size] || sizeClasses.default

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price || 0)
  }



  const handleAddToCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (requireAuth) {
      // Rediriger vers la page d'authentification avec state
      navigate("/auth", { 
        state: { 
          returnUrl: window.location.pathname,
          productName: product.name,
          productId: product.id,
          message: "Connectez-vous pour ajouter cet article à votre panier"
        }
      })
      return
    }
    
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  // Gestion du bouton "Add to Cart" pour la vue liste
  const handleListAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (requireAuth) {
      navigate("/auth", { 
        state: { 
          returnUrl: window.location.pathname,
          productName: product.name,
          productId: product.id,
          message: "Connectez-vous pour ajouter cet article à votre panier"
        }
      })
      return
    }
    
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  return (
    <div 
      className={`group bg-white overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-pink-100 relative ${currentSize.card}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className={`relative overflow-hidden bg-gray-50 ${currentSize.image}`}>
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <img
          src={product.imageUrl || product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          key={product.id}
          onClick={() => navigate(`/product/${product.id}`)}
        />
        
        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
            <BsTag className="w-3 h-3" />
            {product.discount}% OFF
          </div>
        )}
        
        {/* New Tag */}
        {product.tags && product.tags.includes("New") && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
            NEW
          </div>
        )}
        
        {/* Quick Add to Cart Button */}
        {showQuickAdd && onAddToCart && (
          <div className={`absolute bottom-0 left-0 right-0 bg-white transform transition-transform duration-300 ${
            isHovered ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <button
              onClick={handleAddToCartClick}
              disabled={isAddingToCart || requireAuth}
              className={`w-full py-3 text-sm font-bold flex items-center justify-center gap-2 ${
                requireAuth
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isAddingToCart
                  ? "bg-gray-700 text-white"
                  : "bg-black text-white hover:bg-gray-900 transition-colors"
              }`}
            >
              {requireAuth ? (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  SE CONNECTER POUR AJOUTER
                </>
              ) : isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  AJOUTER AU PANIER
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className={currentSize.padding}>
        <div className="mb-2">
          {/* Brand */}
          {showBrand && product.brand && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {product.brand}
              </span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Product Name */}
          <h3 
            className={`font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight ${currentSize.title} hover:text-pink-500 transition-colors cursor-pointer`}
            
          >
            {product.name}
          </h3>
          
          {/* Description */}
          {showDescription && product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}
        </div>
        
        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-black-500 ${currentSize.price}`}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          {/* View Details Button */}
          {showViewButton && (
            <button 
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className={`flex items-center gap-1 ${currentSize.button} text-gray-700 font-medium hover:text-pink-500 transition-colors border border-gray-300 rounded hover:border-pink-300`}
            >
              Voir
            </button>
          )}
        </div>

        {/* Stock Status */}
        {product.stockQuantity !== undefined && (
          <div className="mt-2">
            {product.stockQuantity <= 0 ? (
              <span className="text-xs text-red-600 font-medium">Rupture de stock</span>
            ) : product.stockQuantity <= 10 ? (
              <span className="text-xs text-amber-600 font-medium">Plus que {product.stockQuantity} en stock</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">En stock</span>
            )}
          </div>
        )}

        {/* Bouton "Add to Cart" pour la vue liste (optionnel) */}
        {!showQuickAdd && onAddToCart && (
          <button
            onClick={handleListAddToCart}
            disabled={isAddingToCart || requireAuth}
            className={`w-full mt-3 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 ${
              requireAuth
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isAddingToCart
                ? "bg-gray-700 text-white"
                : "bg-black text-white hover:bg-gray-900 transition-colors"
            }`}
          >
            {requireAuth ? (
              <>
                <FiShoppingCart className="w-4 h-4" />
                Se connecter pour ajouter au panier
              </>
            ) : isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Ajout au panier...
              </>
            ) : (
              <>
                <FiShoppingCart className="w-4 h-4" />
                Ajouter au panier
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// Props par défaut
ProductItem.defaultProps = {
  showQuickAdd: true,
  showDescription: true,
  showBrand: true,
  size: "default",
  showViewButton: true,
  requireAuth: false
}

export default ProductItem