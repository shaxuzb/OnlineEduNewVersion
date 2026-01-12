import Banner from "./_components/Banner";
import FilterButton from "./_components/FilterButton";
import { bannerKeys, categoryKeys, productKeys } from "@/constants/queryKeys";
import {
  getBanners,
  getCategory,
  getProductbyCategory,
} from "@/services/queries";
import CategoryByProducts from "./_components/CategoryByProducts";
import getQueryClient from "@/utils/helpers/getQueryClient";

export default async function Home() {
  const queryClient = getQueryClient();
  await Promise.all([
    await queryClient.prefetchQuery({
      queryKey: [bannerKeys.getAll],
      queryFn: getBanners,
    }),
    await queryClient.prefetchQuery({
      queryKey: [categoryKeys.getCategory],
      queryFn: getCategory,
    }),
    await queryClient.prefetchQuery({
      queryKey: [productKeys.getProductByCategory],
      queryFn: getProductbyCategory,
    }),
  ]);

  return (
    <div className="my-4">
      <Banner />
      <FilterButton />

      <div>
        <CategoryByProducts />
      </div>
    </div>
  );
}
