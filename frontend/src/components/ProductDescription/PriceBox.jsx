import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../API/api";

export default function PriceBox({ price, productId, stockQuantity }) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); 

  const handleAddToCart = async () => {
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/Authentification");
      return;
    }

    try {
      // Vérifier la validité du token
      await api.get("/auth/me");

      // Ajouter au panier
      await api.post("/orders", {
        items: [{ productId, quantity }],
      });

      setMessage(`${quantity} item(s) successfully added to your cart.`);
      setMessageType("success");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/Authentification");
      } else {
        console.error("Add to cart error:", err.response || err);
        setMessage("Unable to add the product to your cart. Please try again.");
        setMessageType("error");
      }
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{price || "0.00"} $</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <label className="text-sm font-medium">Quantity :</label>
          <input
            type="number"
            min={1}
            max={stockQuantity || 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border rounded-md px-2 py-1 w-20"
          />
          <span className="text-gray-500 text-sm">
            / {stockQuantity || 1} available
          </span>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={quantity < 1 || quantity > stockQuantity}
        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>

      {/* Message de feedback */}
      {message && (
        <p
          className={`mt-3 text-sm font-medium ${
            messageType === "success"
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </>
  );
}
