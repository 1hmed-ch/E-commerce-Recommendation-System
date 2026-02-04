import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../API/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data.data.slice(0, 10));
      } catch (err) {
        console.error("Erreur chargement produits", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center">Chargement...</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-20 mt-40">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => navigate(`/product/${product.id}`)}
          className="cursor-pointer border rounded-lg p-4 hover:shadow-lg transition"
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-40 w-full object-cover rounded"
          />

          <h3 className="font-semibold mt-2">{product.name}</h3>
          <p className="text-gray-500 text-sm">{product.category}</p>

          <p className="font-bold mt-1">{product.price} $</p>
        </div>
      ))}
    </div>
  );
}
