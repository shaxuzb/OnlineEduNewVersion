import { productKeys } from "@/constants/queryKeys";
import { getRecommendedProduct } from "@/services/queries";
import RecommendedProducts from "@/components/cards/RecommendedProducts";
import CartList from "./_components/CartList";
import { queryClient } from "@/utils/helpers/queryClient";

export default async function CartPage() {
  await queryClient.prefetchQuery({
    queryKey: [productKeys.getRecommended, "1"], // productId ni queryKey ichiga qo'shish kerak
    queryFn: () => getRecommendedProduct("1"),
  });
  return (
      <div className="my-4">
        <div>
          <CartList />
        </div>
        <div>
          <RecommendedProducts />
        </div>
      </div>
  );
}
