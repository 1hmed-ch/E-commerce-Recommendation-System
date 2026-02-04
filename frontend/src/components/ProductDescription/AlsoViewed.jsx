// import { alsoViewed } from "../Pages/alsoViewed";
// import ProductCard from "./ProductCard";

export default function AlsoViewed() {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-4">
        Articles également consultés
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* {alsoViewed.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))} */}
      </div>
    </div>
  );
}