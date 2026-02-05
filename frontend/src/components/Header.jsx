// src/components/Header.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import Navbar from "./Navbar";
import { FiSearch, FiUser, FiShoppingBag, FiChevronUp } from "react-icons/fi";

function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [isTop, setIsTop] = useState(true);
  const headerRef = useRef(null);

  // Gérer l'affichage du header au scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const headerHeight = headerRef.current?.offsetHeight || 0;

      // Vérifier si on est en haut de page
      setIsTop(currentScrollY < 10);

      // Cacher le header quand on descend, montrer quand on remonte
      if (currentScrollY > lastScrollY && currentScrollY > headerHeight) {
        // On descend - cacher le header
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY) {
        // On remonte - montrer le header
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/cart', {
        state: {
          returnUrl: '/cart',
          message: 'Connectez-vous pour accéder à votre panier'
        }
      });
    }
  };

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/auth');
    } else {
      navigate('/auth', {
        state: {
          returnUrl: '/auth',
          message: 'Connectez-vous pour accéder à votre compte'
        }
      });
    }
  };

  // Bouton "back to top" qui apparaît quand le header est caché
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Header principal avec animation */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-lg transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'
          } ${isTop ? 'shadow-none' : 'shadow-lg'}`}
      >
        {/* Top info bar - se cache au scroll */}
        <div className={`bg-black text-white text-xs py-2 transition-all duration-300 ${!showHeader || !isTop ? 'h-0 py-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
          }`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span>FREE SHIPPING ON ORDERS OVER $29</span>
                <span className="hidden md:inline">|</span>
                <span className="hidden md:inline">30-DAY RETURNS</span>
                <span className="hidden md:inline">|</span>
                <span className="hidden md:inline">
                  {isAuthenticated ? (
                    <span className="text-green-300">
                      Welcome, {user?.firstName || user?.username || 'User'}!
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate('/auth')}
                      className="hover:text-green-300 transition-colors"
                    >
                      JOIN REWARDS
                    </button>
                  )}
                </span>
              </div>
              <div className="text-xs">
                <select className="bg-transparent border-none focus:outline-none">
                  <option>🇺🇸 USA</option>
                  <option>🇫🇷 FRANCE</option>
                  <option>🇪🇸 SPAIN</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-black tracking-tighter">
                SH<span className="text-red-500">OP</span>
              </h1>
            </div>

            {/* Barre de recherche - version desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-20 py-3 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Icons - Droite */}
            <div className="flex items-center gap-6">
              {/* Mobile search icon */}
              <div className="lg:hidden">
                <FiSearch className="text-xl text-gray-700 cursor-pointer hover:text-black" />
              </div>

              {/* User icon */}
              <div className="hidden md:flex flex-col items-center cursor-pointer group">
                <div
                  className="p-2 rounded-full group-hover:bg-gray-100 transition-colors"
                  onClick={handleAccountClick}
                >
                  <FiUser className="text-xl text-gray-700" />
                </div>
                <span className="text-xs mt-1">
                  {isAuthenticated ? (user?.firstName || 'Account') : 'Sign In'}
                </span>
              </div>

              {/* Cart icon */}
              <div className="flex flex-col items-center cursor-pointer group">
                <a
                  href={isAuthenticated ? "/cart" : "#"}
                  onClick={handleCartClick}
                  className="flex flex-col items-center"
                >
                  <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                    <FiShoppingBag className="text-xl text-gray-700" />
                  </div>
                  <span className="text-xs mt-1">Cart</span>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile search - se cache aussi */}
          <div className={`lg:hidden mt-3 transition-all duration-300 ${!showHeader || !isTop ? 'h-0 opacity-0 overflow-hidden' : 'h-auto opacity-100'
            }`}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-none focus:outline-none"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </form>

            {/* Mobile auth buttons */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <button
                onClick={handleAccountClick}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isAuthenticated ? 'My Account' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>

        <Navbar isAuthenticated={isAuthenticated} user={user} />
      </header>

      {/* Bouton "back to top" qui apparaît quand on scroll */}
      <button
        onClick={handleBackToTop}
        className={`fixed right-6 z-40 bg-black text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-gray-800 ${!showHeader && !isTop
            ? 'bottom-6 opacity-100'
            : '-bottom-20 opacity-0'
          }`}
        aria-label="Back to top"
      >
        <FiChevronUp className="w-5 h-5" />
      </button>

      {/* Espace pour compenser le header fixe */}
      <div className="h-[12px]"></div>
    </>
  );
}

export default Header;