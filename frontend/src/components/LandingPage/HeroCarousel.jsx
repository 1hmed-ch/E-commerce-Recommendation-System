// src/pages/LandingPage/components/HeroCarousel.jsx
import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";

const SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1920&h=800&fit=crop&q=80",
    title: "Premium Collection",
    subtitle: "Luxury fashion & accessories",
    cta: "View Collection",
    badge: "PREMIUM"

  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop&q=80",
    title: "Summer Sale",
    subtitle: "Up to 60% off selected items",
    cta: "Explore Deals",
    badge: "SALE"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1920&h=800&fit=crop&q=80",
    title: "New Arrivals",
    subtitle: "Discover the latest collections from top brands",
    cta: "Shop Now",
    badge: "NEW"
  },
];
const HeroCarousel = ({ onShopNow }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto slide
  useEffect(() => {
    if (isHovering) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex, isHovering]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  return (
    <section
      className="relative h-[500px] overflow-hidden mt-4"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {SLIDES.map((slide) => (
          <div key={slide.id} className="min-w-full h-full relative">
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl w-full mx-auto px-8">
                <div className="max-w-lg">
                  <span className="inline-flex items-center px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-black text-xs font-medium tracking-wider mb-6">
                    {slide.badge}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-serif font-light text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-white/90 mb-8 max-w-md font-light">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={onShopNow}
                    className="px-8 py-3 bg-white text-black rounded-md font-medium hover:bg-gray-100 transition-all flex items-center space-x-2 group border border-white/20"
                  >
                    <span className="tracking-wider">{slide.cta}</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-md hover:bg-white transition-all"
      >
        <FiChevronLeft className="text-black text-lg" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-md hover:bg-white transition-all"
      >
        <FiChevronRight className="text-black text-lg" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 ${idx === currentIndex
                ? "w-8 h-1 bg-white rounded-full"
                : "w-2 h-1 bg-white/50 rounded-full hover:bg-white/80"
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;