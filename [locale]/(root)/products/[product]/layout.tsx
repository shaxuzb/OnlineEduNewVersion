import { productKeys } from "@/constants/queryKeys";
import { getRecommendedProduct, getShowProduct } from "@/services/queries";
import ProductShowCard from "./_components/ProductShowCard";
import RecommendedProducts from "@/components/cards/RecommendedProducts";
import ScrollToTop from "@/components/ScrollToTop";
import { Metadata } from "next";
import { getLocalized } from "@/utils/utils";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import getQueryClient from "@/utils/helpers/getQueryClient";

// Cache control
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; product: string }>;
}): Promise<Metadata> => {
  const { locale, product } = await params;

  // Faqat metadata uchun ma'lumot olish
  try {
    const data = await getShowProduct(product);

    return {
      title: getLocalized(data.data, "name", locale),
      description: getLocalized(data.data, "ingredient", locale),
      keywords: getLocalized(data.data, "keywords", locale),
      openGraph: {
        title: getLocalized(data.data, "name", locale),
        description: getLocalized(data.data, "ingredient", locale),
        images: [
          {
            url: data.data.image_path.thumb,
            alt: getLocalized(data.data, "name", locale),
            width: 253,
            height: 190,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Metadata olishda xato:", error);
    return {
      title: "Product",
      description: "Product description",
    };
  }
};

export default async function ProductLayout({
  params,
}: {
  params: Promise<{ product: string }>;
}) {
  try {
    const { product } = await params;

    const queryClient = getQueryClient();

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: [productKeys.getShowProduct, product],
        queryFn: () => getShowProduct(product),
      }),
      queryClient.prefetchQuery({
        queryKey: [productKeys.getRecommended, product],
        queryFn: () => getRecommendedProduct(product),
      }),
    ]);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div>
          <ScrollToTop />
          <div className="my-4">
            <ProductShowCard />
            <RecommendedProducts />
          </div>
        </div>
      </HydrationBoundary>
    );
  } catch (error) {
    console.error("Product layout error:", error);
    return <div>Error loading product</div>;
  }
}
