export default function ProductGallery({ image }) {
  return (
    <div className="flex gap-4">
      <img
        src={image}
        className="w-105 h-105 object-contain border rounded"
        alt="product"
      />
    </div>
  );
}