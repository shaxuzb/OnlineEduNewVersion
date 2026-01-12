"use client";

import LoginModal from "@/components/navbar/components/login/components/LoginModal";
import ScrollToTop from "@/components/ScrollToTop";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Breadcrumb from "@/components/widgets/AppBreadcrumb";
import { Link } from "@/i18n/navigation";
import {
  setAddCartList,
  setClearCartList,
  setIncrementCartList,
  setRemoveCartList,
} from "@/store/features/cartListSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ProductData } from "@/types/interface";
import { FreeCart } from "@/utils/CustomIcons";
import { getLocalized, numberSpacing } from "@/utils/utils";
import { Delete, Minus, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "@bprogress/next/app";

interface ModalItemProps {
  type: "clear" | "delete";
  item?: Omit<ProductData, "combo_items"> & {
    combo_items: ProductData["combo_items"][0]["items"][0][];
  };
}
const CartList = () => {
  const t = useTranslations();
  const locale = useLocale();
  const cartList = useAppSelector((state) => state.cartList.items);
  const [authModal, setAuthModal] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  // const deleveryType = useAppSelector((state) => state.cartList.deliveryType);
  // const deleveryPrice = deleveryType === "delivery" ? 10000 : 0;
  const [cartModal, setCartModal] = useState(false);
  const [modalItem, setModalItem] = useState<ModalItemProps | null>(null);
  const dispatch = useAppDispatch();
  const handleAddCart = (
    item: Omit<ProductData, "combo_items"> & {
      combo_items: ProductData["combo_items"][0]["items"][0][];
    }
  ) => {
    dispatch(setAddCartList({ ...item, combo_items: item.combo_items }));
  };
  const handleDeleteCart = (
    item: Omit<ProductData, "combo_items"> & {
      combo_items: ProductData["combo_items"][0]["items"][0][];
    }
  ) => {
    if (item.quantity === 1) {
      return setCartModal(true), setModalItem({ type: "delete", item: item });
    }
    dispatch(setIncrementCartList({ ...item, combo_items: item.combo_items }));
  };
  const handleClearCart = () => {
    dispatch(setClearCartList());
    setCartModal(false);
  };
  const handleRoute = () => {
    if (user) {
      router.push("/checkout");
    } else {
      setAuthModal(true);
    }
  };
  if (!(cartList && cartList.length > 0)) {
    return (
      <div className="w-full h-[500px] flex justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <div className="w-32">
            <FreeCart />
          </div>
          <h1 className="text-2xl font-medium mt-3">
            {t("Cart.FreeCart.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("Cart.FreeCart.description")}
          </p>
          <Link href={"/"} className="mt-6">
            <Button>{t("Cart.FreeCart.button")}</Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div>
      <ScrollToTop />
      <Breadcrumb items={[{ label: "Cart.title", isCurrent: true }]} />
      <div className={`flex gap-4 max-[990px]:flex-col`}>
        <div className="grow">
          <div>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{t("Cart.title")}</h1>
              <Button
                onClick={() => {
                  setCartModal(true);
                  setModalItem({
                    type: "clear",
                  });
                }}
                variant={"ghost"}
                className="hover:bg-blue-600/5"
              >
                <Delete />
                {t("Buttons.clear")}
              </Button>
            </div>
            <div className="bg-accent"></div>
          </div>
          <div className="bg-white rounded-xl mt-3">
            {cartList.map((item, index) => (
              <div
                key={index}
                className={`flex gap-5 p-3 ${
                  cartList.length > 0 && index !== 0 && "border-t"
                }`}
              >
                <div className="aspect-[1_/_1] max-w-17 flex justify-center items-center rounded-xl overflow-hidden relative">
                  <div className="overlay"></div>
                  <Image
                    src={`${item.images?.product ?? item.image_path.product}`}
                    width={"400"}
                    height={"500"}
                    className="object-contain z-[1]"
                    alt="product image"
                  />
                </div>

                <div className="flex justify-between w-full">
                  <div className="flex flex-col justify-between">
                    <h1 className="font-semibold text-lg">
                      {getLocalized(item, "name", locale)}
                    </h1>
                    <span className="font-medium hidden max-[750px]:block">
                      {numberSpacing(item.price * item.quantity)} UZS
                    </span>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <span className="font-semibold max-[750px]:hidden">
                      {numberSpacing(item.price * item.quantity)} UZS
                    </span>
                    <div className="flex items-center bg-secondary rounded-md">
                      <Button
                        variant={"ghost"}
                        data-type="minus-button"
                        className="active:bg-border"
                        onClick={() =>
                          handleDeleteCart({
                            ...item,
                            combo_items: item.combo_items,
                          })
                        }
                      >
                        <Minus />
                      </Button>
                      <Button
                        variant={"link"}
                        className="text-black hover:no-underline w-3"
                        data-type="value"
                      >
                        {item.quantity}
                      </Button>
                      <Button
                        variant={"ghost"}
                        data-type="plus-button"
                        className="active:bg-border"
                        onClick={() =>
                          handleAddCart({
                            ...item,
                            combo_items: item.combo_items,
                          })
                        }
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Dialog open={cartModal} onOpenChange={setCartModal}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Diqqat!</DialogTitle>
              </DialogHeader>
              {modalItem && (
                <div>
                  <p className="mt-4 text-muted-foreground">
                    {modalItem?.type === "delete"
                      ? t("Cart.modalDelete.delete")
                      : t("Cart.modalDelete.deleteAll")}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <Button variant={"secondary"} className="py-6">
                      {t("Buttons.no")}
                    </Button>
                    <Button
                      onClick={() => {
                        if (modalItem?.type === "delete" && modalItem.item) {
                          return (
                            dispatch(
                              setRemoveCartList({
                                ...modalItem.item,
                                combo_items: modalItem.item.combo_items,
                              })
                            ),
                            setCartModal(false)
                          );
                        }
                        handleClearCart();
                      }}
                      className="py-6"
                    >
                      {t("Buttons.yes")}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-white p-3 rounded-lg h-fit w-86 mt-12 max-[990px]:w-full max-[990px]:mt-2">
          <h1 className="text-lg font-semibold">{t("Global.total")}</h1>
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-[15px]">{t("Cart.products")}</span>
              <span className="text-[15px] font-medium">
                {numberSpacing(
                  cartList.reduce(
                    (arr, cerr) => arr + cerr.price * cerr.quantity,
                    0
                  )
                )}{" "}
                UZS
              </span>
            </div>
            {/* <div className="flex justify-between items-center">
              <span className="text-[15px]">{t("Buttons.delivery")}</span>
              <span className="text-[15px] font-medium">
                {numberSpacing(deleveryPrice)} UZS
              </span>
            </div> */}
            <div className="flex justify-between items-center">
              <span className="text-[15px]">{t("Cart.paymentPrice")}</span>
              <span className="text-[15px] font-medium">
                {numberSpacing(
                  Number(
                    cartList.reduce(
                      (arr, cerr) => arr + cerr.price * cerr.quantity,
                      0
                    )
                  )
                )}{" "}
                UZS
              </span>
            </div>
          </div>
          <div className="max-[990px]:fixed max-[990px]:bottom-0 max-[990px]:left-0 z-10 max-[990px]:bg-white max-[990px]:w-full max-[990px]:p-4">
            <Button
              className="w-full mt-4 max-[990px]:mt-0 flex justify-center !font-medium max-[750px]:py-6 max-[750px]:justify-between max-[750px]:text-[16px]"
              onClick={handleRoute}
            >
              {t("Buttons.toCheckout")}{" "}
              <span className="text-[15px] font-medium hidden max-[750px]:block max-[750px]:text-lg max-[750px]:font-semibold">
                {numberSpacing(
                  cartList.reduce(
                    (arr, cerr) => arr + cerr.price * cerr.quantity,
                    0
                  )
                )}{" "}
                UZS
              </span>
            </Button>
          </div>
        </div>
      </div>
      <LoginModal open={authModal} setOpen={setAuthModal} />
    </div>
  );
};

export default CartList;
