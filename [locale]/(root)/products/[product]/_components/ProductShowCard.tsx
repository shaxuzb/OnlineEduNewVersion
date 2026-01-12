"use client";

import { useGetComments, useGetShowProduct } from "@/services/queries";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
import { Minus, Plus, ShoppingBag, SlashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Rating, RatingButton } from "@/components/ui/rating";
import { numberSpacing } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocale, useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ProductData } from "@/types/interface";
import {
  setAddCartList,
  setIncrementCartList,
  setRemoveCartList,
} from "@/store/features/cartListSlice";
import ScrollToTop from "@/components/ScrollToTop";
import { getLocalized } from "@/utils/utils";
import { useEffect, useState } from "react";
import CommentModal from "./CommentModal";
import DynamicTitle from "@/components/DynamicTitle";
interface selectedProduct {
  id: number;
  combo_id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  image_path: {
    thumb: string;
    product: string;
    original: string;
  };
  extra_price: number;
  category_id: number;
}
const ProductShowCard = () => {
  const params = useParams();
  const [commentModal, setCommentModal] = useState(false);
  const t = useTranslations();
  const [selectedComboItems, setSelectedComboItems] = useState<
    selectedProduct[]
  >([]);
  const { data } = useGetShowProduct(params.product?.toString() ?? "");
  const { data: comments } = useGetComments(Number(data?.data.id));
  const cartItems = useAppSelector((state) => state.cartList.items);
  const cartItem = cartItems.find(
    (item) =>
      item.id === data?.data.id &&
      JSON.stringify(item.combo_items ?? []) ===
        JSON.stringify(
          [...selectedComboItems] // 🔑 massivni kopiya qilib oldik
            .sort((a, b) => a.id - b.id)
        )
  );
  const dispatch = useAppDispatch();
  const locale = useLocale();

  const handleAddCart = (item: ProductData) => {
    dispatch(setAddCartList({ ...item, combo_items: selectedComboItems }));
  };
  const handleDeleteCart = (item: ProductData) => {
    if (cartItem?.quantity === 1) {
      return dispatch(
        setRemoveCartList({ ...item, combo_items: selectedComboItems })
      );
    }
    dispatch(
      setIncrementCartList({ ...item, combo_items: selectedComboItems })
    );
  };
  const handleSelectComboItem = (
    categoryId: number,
    item: ProductData["combo_items"][0]["items"][0]
  ) => {
    setSelectedComboItems((prev) => {
      // categoryId bo‘yicha borligini tekshirish
      const existsIndex = prev.findIndex(
        (combo) => combo.category_id === categoryId
      );

      if (existsIndex !== -1) {
        // Agar shu categoryId bor bo‘lsa, itemni yangilaymiz
        const updated = [...prev];
        updated[existsIndex] = { ...item, category_id: categoryId };
        return updated;
      }

      // Yangi category qo‘shish
      return [...prev, { ...item, category_id: categoryId }];
    });
  };

  useEffect(() => {
    if (data?.data?.combo_items) {
      const initialSelections: (ProductData["combo_items"][0]["items"][0] & {
        category_id: number;
      })[] = [];

      data.data.combo_items.forEach((combo) => {
        if (combo.items.length > 0) {
          initialSelections.push({
            ...combo.items[0], // itemning barcha fieldlari
            category_id: combo.category_id, // qo‘shimcha field
          });
        }
      });

      setSelectedComboItems(initialSelections);
    }
  }, [data?.data?.combo_items]);
  if (!data?.data) {
    return notFound();
  }
  return (
    <div>
      <DynamicTitle title={getLocalized(data?.data, "name", locale)} />
      <ScrollToTop />
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t("Home.title")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="-rotate-12">
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>
              {getLocalized(data.data, "name", locale)}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="bg-white flex rounded-2xl max-[1000px]:flex-col">
        <div className="w-1/2 max-[1000px]:w-full p-5 aspect-[4_/_3] max-[1000px]:aspect-auto">
          <div className="aspect-[4_/_3] max-[1000px]:max-w-[536px] rounded-xl overflow-hidden relative">
            {data.data.modifier && data.data.modifier.length > 0 && (
              <div className="absolute left-0 top-7 p-1 pl-2 bg-white z-10 flex rounded-r-full">
                {data.data.modifier.map((modifier, index) => (
                  <div
                    key={modifier.id}
                    className={`rounded-full overflow-hidden ${
                      index > 0 && "-ml-3"
                    }`}
                  >
                    {
                      <Image
                        src={`${modifier.images.modifier}`}
                        width={"30"}
                        height={"30"}
                        className="object-cover mix-blend-multiply"
                        alt="product image"
                      />
                    }
                  </div>
                ))}
              </div>
            )}
            <div className="overlay !-z-10"></div>
            <Image
              src={`${data.data.image_path.product}`}
              width={"600"}
              height={"600"}
              className="object-cover z-50"
              alt="product image"
            />
          </div>
        </div>
        <div className="w-1/2 max-[1000px]:w-full max-[1000px]:border-none border-l border-border flex flex-col aspect-[4_/_3] max-[1000px]:aspect-auto">
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-bold">
                  {getLocalized(data.data, "name", locale)}
                </h1>
                <div className="flex items-center">
                  <div className="flex items-center ">
                    {/* <span>100g</span> */}
                    {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={"ghost"}>
                      <CircleAlert />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent align="start" side="bottom">
                    <p>Add to library</p>
                  </TooltipContent>
                </Tooltip> */}
                  </div>
                  <span className="text-green-600">Mavjud</span>
                </div>
              </div>
              <Button
                variant={"outline"}
                onClick={() => setCommentModal(true)}
                className="text-[12px] font-medium cursor-pointer h-7 rounded-sm"
              >
                {comments?.data.length ?? 0} {t("Comment.viewComment")}
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Rating readOnly value={Math.floor(data.data.average_rating)}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton key={index} />
                ))}
              </Rating>
              <span className="text-[13px] font-medium">
                {data.data.average_rating}/5
              </span>
            </div>
            <div className="bg-secondary p-2 rounded-md mt-2">
              <span>50 daqiqa ichida yetkazamiz</span>
            </div>
            <div>
              <span className="text-[12px] text-muted-foreground mt-2">
                {getLocalized(data.data, "ingredient", locale)}
              </span>
            </div>
            <div className="overflow-y-auto px-1 pb-2">
              {data.data.combo_items.length > 0 &&
                data.data.combo_items.map((comboItem) => (
                  <div key={comboItem.category_id} className="mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm lowercase">
                        {getLocalized(comboItem, "name", locale)}
                      </span>
                      <span className="text-sm text-muted-foreground lowercase">
                        {t("Comment.minimumOne")}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 mt-3 gap-3">
                      {comboItem.items.map((childItem) => (
                        <div
                          key={childItem.id}
                          onClick={() =>
                            handleSelectComboItem(
                              comboItem.category_id,
                              childItem
                            )
                          }
                          className={`flex flex-col justify-center -translate-y-1 duration-200 active:translate-y-0 items-center bg-blue-300/30 p-2 rounded-lg
                          ${
                            selectedComboItems.find(
                              (item) => item.id === childItem.id
                            )?.id === childItem.id
                              ? "shadow_combo border-t-1 border-ring"
                              : ""
                          }`}
                        >
                          <div className="aspect-[1_/_1] max-[1000px]:max-w-[536px] rounded-lg overflow-hidden relative w-11 flex justify-center items-center">
                            <div className="overlay"></div>
                            <Image
                              src={`${childItem.image_path.thumb}`}
                              width={30}
                              height={30}
                              className="object-cover mix-blend-multiply"
                              alt="product image"
                            />
                          </div>
                          <div className="flex flex-col items-center text-sm mt-1">
                            <span>
                              {getLocalized(comboItem, "name", locale)}
                            </span>
                            {childItem.extra_price > 0 ? (
                              <span>
                                {numberSpacing(childItem.extra_price)} UZS
                              </span>
                            ) : (
                              <span className="text-green-800">
                                {t("Comment.free")}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="hidden max-[750px]:block fixed bottom-0 z-10 bg-white left-0 w-full px-4 p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {t("Comment.price")}:
              </span>
              <span className="font-bold text-[18px]">
                {numberSpacing(data.data.price)} UZS
              </span>
            </div>
            <div className="mt-2">
              {cartItem ? (
                <div className="flex gap-4">
                  <div className="flex items-center bg-secondary rounded-md">
                    <Button
                      variant={"ghost"}
                      data-type="minus-button"
                      className="active:bg-border"
                      onClick={() => handleDeleteCart(data.data)}
                    >
                      <Minus />
                    </Button>
                    <Button
                      variant={"link"}
                      className="text-black hover:no-underline w-3"
                      data-type="value"
                    >
                      {cartItem?.quantity}
                    </Button>
                    <Button
                      variant={"ghost"}
                      data-type="plus-button"
                      className="active:bg-border"
                      onClick={() => handleAddCart(data.data)}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Link href={"/cart"} className="w-full">
                    <Button className="!w-full">
                      <ShoppingBag /> {t("Buttons.toCart")}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleAddCart(data.data)}
                >
                  {t("Buttons.add")}
                </Button>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center px-5 max-[750px]:hidden py-3 border-t">
            <span className="font-bold text-[18px]">
              {numberSpacing(data.data.price)} UZS
            </span>

            {cartItem ? (
              <div className="flex gap-4">
                <div className="flex items-center bg-secondary rounded-md">
                  <Button
                    variant={"ghost"}
                    data-type="minus-button"
                    className="active:bg-border"
                    onClick={() => handleDeleteCart(data.data)}
                  >
                    <Minus />
                  </Button>
                  <Button
                    variant={"link"}
                    className="text-black hover:no-underline w-3"
                    data-type="value"
                  >
                    {cartItem?.quantity}
                  </Button>
                  <Button
                    variant={"ghost"}
                    data-type="plus-button"
                    className="active:bg-border"
                    onClick={() => handleAddCart(data.data)}
                  >
                    <Plus />
                  </Button>
                </div>
                <Link href={"/cart"}>
                  <Button>
                    <ShoppingBag /> {t("Buttons.toCart")}
                  </Button>
                </Link>
              </div>
            ) : (
              <Button onClick={() => handleAddCart(data.data)}>
                {t("Buttons.add")}
              </Button>
            )}
          </div>
        </div>
      </div>
      <CommentModal
        open={commentModal}
        setOpen={setCommentModal}
        data={comments?.data ?? []}
      />
    </div>
  );
};

export default ProductShowCard;
