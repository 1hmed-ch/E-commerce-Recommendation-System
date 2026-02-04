import RatingStars from "./RatingStars";
import PriceBox from "./PriceBox";

export default function ProductInfo({ product }) {
    return (
        <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">{product.name}</h1>
                <span className="bg-pink-50 text-pink-700 text-xs px-2 py-1 rounded">
                    {product.stockQuantity} items left in stock
                </span>
            </div>
            

            <div className="flex items-center gap-3">
                <RatingStars rating={4.5} />
                <span className="text-sm text-gray-600">(44,503)</span>
                
            </div>

            <PriceBox price={product.price} productId={product.id} stockQuantity={product.stockQuantity} />
            <p className="text-gray-700">{product.description}</p>
        </div>
    );
}