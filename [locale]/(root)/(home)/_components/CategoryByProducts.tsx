"use client";
import ProductCard from "@/components/cards/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useGetProductByCategory } from "@/services/queries";
import { useAppSelector } from "@/store/hooks";
import { getLocalized, numberSpacing } from "@/utils/utils";
import { ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const CategoryByProducts = () => {
  const locale = useLocale();
  const cartList = useAppSelector((state) => state.cartList.items);
  const t = useTranslations();
  const { data } = useGetProductByCategory();

  
  return (
    <div>
      {data?.data &&
        data.data.map((item) => (
          <section
            id={item.category.name_en.split(" ").join("_").toLowerCase()}
            className={`mt-3 category-product-section !scroll-mt-20`}
            key={item.category.id}
          >
            <h1 className="text-3xl font-bold">
              {getLocalized(item.category, "name", locale)}
              {/* {(item.category as any)[`name_${locale}`]} */}
            </h1>
            <div className="grid grid-cols-4 max-[1000px]:grid-cols-3 max-[765px]:grid-cols-2 gap-4 mt-5">
              {item.items
                ? item.items.map((product) => (
                    <ProductCard item={product} key={product.id} />
                  ))
                : "No product"}
            </div>
          </section>
        ))}
      {cartList.length > 0 && (
        <div className="hidden max-[1180px]:block max-[1180px]:bg-white max-[1180px]:w-full max-[1180px]:p-5 max-[1180px]:py-6 max-[1180px]:fixed max-[1180px]:bottom-0  max-[1180px]:left-0">
          <Link href={"/cart"}>
            <Button className="!text-white bg-purple-500 h-9 text-lg hover:bg-purple-500/75 w-full py-6 flex justify-between">
              <div className="flex gap-3 items-center">
                <ShoppingCart className="size-6" />
                {/* {t("Cart.title")} */}
                Savat
              </div>
              <span>
                {numberSpacing(
                  cartList.reduce(
                    (arr, cerr) => arr + cerr.price * cerr.quantity,
                    0
                  )
                )}{" "}
                UZS
              </span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryByProducts;
