import RatingStars from "./RatingStars";

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg p-3 space-y-2 hover:shadow-md">
      <img
        src={product.image_url} alt={product.name}
        className="h-40 w-full object-contain"
      />
      <h3 className="text-sm font-medium">{product.name}</h3>
      <RatingStars rating={product.rating} />
      <p className="font-semibold">{product.price} $</p>
    </div>
  );
}