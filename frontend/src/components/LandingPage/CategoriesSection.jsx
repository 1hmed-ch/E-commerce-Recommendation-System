// src/pages/LandingPage/components/CategoriesSection.jsx
import { FiArrowRight } from "react-icons/fi";

import {
  FiHome,
  FiMonitor,
  FiSmile,
  FiShoppingBag,
  FiPackage,
  FiTruck,
  FiActivity,
  FiBriefcase,
  FiTool,
  FiCoffee
} from "react-icons/fi";

const CATEGORIES = [
  {
    id: 1,
    name: "Home & Living",
    icon: <FiHome className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=600&fit=crop&q=80",
    color: "bg-stone-50",
    iconColor: "text-stone-700"
  },
  {
    id: 2,
    name: "Electronics",
    icon: <FiMonitor className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&h=600&fit=crop&q=80",
    color: "bg-slate-50",
    iconColor: "text-slate-700"
  },
  {
    id: 3,
    name: "Beauty",
    icon: <FiSmile className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop&q=80",
    color: "bg-rose-50",
    iconColor: "text-rose-700"
  },
  {
    id: 4,
    name: "Women's",
    icon: <FiShoppingBag className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop&q=80",
    color: "bg-fuchsia-50",
    iconColor: "text-fuchsia-700"
  },
  {
    id: 5,
    name: "Kids",
    icon: <FiPackage className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=600&h=600&fit=crop&q=80",
    color: "bg-amber-50",
    iconColor: "text-amber-700"
  },
  {
    id: 6,
    name: "Automotive",
    icon: <FiTruck className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&h=600&fit=crop&q=80",
    color: "bg-orange-50",
    iconColor: "text-orange-700"
  },
  {
    id: 7,
    name: "Sports",
    icon: <FiActivity className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&q=80",
    color: "bg-emerald-50",
    iconColor: "text-emerald-700"
  },
  {
    id: 8,
    name: "Men's",
    icon: <FiBriefcase className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=600&fit=crop&q=80",
    color: "bg-indigo-50",
    iconColor: "text-indigo-700"
  },
  {
    id: 9,
    name: "Tools",
    icon: <FiTool className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=600&fit=crop&q=80",
    color: "bg-red-50",
    iconColor: "text-red-700"
  },
  {
    id: 10,
    name: "Grocery",
    icon: <FiCoffee className="w-5 h-5" />,
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=600&h=600&fit=crop&q=80",
    color: "bg-teal-50",
    iconColor: "text-teal-700"
  }
];
const CategoriesSection = ({ onCategoryClick, onViewAll }) => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-black tracking-tight mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-600 text-sm font-light">
              Curated collections from our premium selection
            </p>
          </div>
          <button
            onClick={onViewAll}
            className="text-black hover:text-gray-700 font-medium flex items-center space-x-2 group mt-4 md:mt-0 text-sm tracking-wide"
          >
            <span>View All</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.name)}
              className="group flex flex-col items-center space-y-4"
            >
              {/* Image Container */}
              <div className="relative w-full max-w-[140px] aspect-square">
                <div className="absolute inset-2 rounded-[50px] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Category Name */}
              <div className="text-center">
                <h3 className="text-sm font-medium text-black tracking-wide group-hover:text-gray-700 transition-colors">
                  {category.name}
                </h3>
                <div className="w-8 h-px bg-gray-300 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;