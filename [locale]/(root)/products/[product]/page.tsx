import RecommendedProducts from "@/components/cards/RecommendedProducts";
import ProductShowCard from "./_components/ProductShowCard";

export default async function ProductPage() {
  return (
      <div className="my-4">
        <ProductShowCard />
        <div>
          <RecommendedProducts />
        </div>
      </div>
  );
}
