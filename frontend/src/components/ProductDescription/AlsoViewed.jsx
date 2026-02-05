import { useEffect, useState } from "react";
import productService from "../../services/productService";
import ProductItem from "../ProductItem";

export default function AlsoViewed({ currentProductId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!currentProductId) return;

      setLoading(true);
      try {
        const result = await productService.getRecommendations(currentProductId);
        if (result.success) {
          setRecommendations(result.data);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId]);

  if (loading) {
    return (
      <div className="mt-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-square"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 border-t border-gray-100 pt-12">
      <h2 className="text-2xl font-serif font-light text-black mb-8">
        You May Also Like
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.slice(0, 4).map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            showQuickAdd={true}
            size="default"
          />
        ))}
      </div>
    </div>
  );
}