import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../API/api";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import AlsoViewed from "./AlsoViewed";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error("Erreur chargement produit", err);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) return <p className="text-center">Chargement...</p>;
  
  return (
    <div className="max-w-7xl mx-auto p-6 mt-55 mb-20">
      <div className="grid md:grid-cols-2 gap-8">
        <ProductGallery image={product.imageUrl} />
        <ProductInfo product={product} />
      </div>
      <AlsoViewed />
    </div>
  );
}