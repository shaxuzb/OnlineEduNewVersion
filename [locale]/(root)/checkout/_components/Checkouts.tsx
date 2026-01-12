"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  setAddCartList,
  setClearCartList,
  setIncrementCartList,
} from "@/store/features/cartListSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ProductData } from "@/types/interface";
import { getLocalized, numberSpacing } from "@/utils/utils";
import {
  ChevronDown,
  LocateIcon,
  Minus,
  Plus,
  SlashIcon,
  Store,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { useFormik } from "formik";
import PersonalInfo from "./PersonalInfo";
import PaymentType from "./PaymentType";
import { useEffect, useState } from "react";
import DeleveryTypeModal from "@/components/navbar/components/deleverytype/components/DeleveryTypeModal";
import { $axiosPrivate } from "@/services/AxiosService";
import AddressPopover from "@/components/navbar/components/deleverytype/components/AddressPopover";
import * as Yup from "yup";
import { useRouter } from "@bprogress/next/app";

const validationSchema = Yup.object().shape({
  delivery_type: Yup.string().required("Yetkazib berish turi majburiy"),
  branch_id: Yup.number()
    .nullable()
    .when("delivery_type", {
      is: (val: any) => val === "takeaway", // faqat filialdan olinganda
      then: (schema) => schema.required("Filialni tanlash majburiy"),
      otherwise: (schema) => schema.nullable(),
    }),
  address_id: Yup.number()
    .nullable()
    .when("delivery_type", {
      is: (val: any) => val === "delivery", // agar yetkazib berish bo‘lsa
      then: (schema) => schema.required("Manzil majburiy"),
      otherwise: (schema) => schema.nullable(),
    }),
  payment_method_id: Yup.number().required("To‘lov usuli majburiy"),
  items: Yup.array()
    .of(
      Yup.object().shape({
        product_id: Yup.number().required("Mahsulot ID majburiy"),
        quantity: Yup.number()
          .required("Miqdor majburiy")
          .min(1, "Miqdor kamida 1 bo‘lishi kerak"),
        combo_items: Yup.array().of(Yup.number()),
      })
    )
    .min(1, "Savat bo‘sh bo‘lishi mumkin emas"),
});
export interface InitialValuesCheckout {
  payment_method_id: number;
  delivery_type: string;
  address_id: number | null; // required in delivery
  branch_id: number | null; // required in takeaway
  items: {
    product_id: number | null;
    quantity: number | null;
    combo_items: number[];
  }[];
}
const Checkouts = () => {
  const t = useTranslations();
  const locale = useLocale();
  const cartList = useAppSelector((state) => state.cartList.items);
  const branch = useAppSelector((state) => state.cartList.branches);
  const router = useRouter();
  const [addressModal, setAddressModal] = useState(false);
  const [popover, setPopover] = useState(false);
  const [finished, setFinished] = useState(false);
  const deleveryType = useAppSelector((state) => state.cartList.deliveryType);
  const address = useAppSelector((state) => state.cartList.address);
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
    dispatch(setIncrementCartList({ ...item, combo_items: item.combo_items }));
  };
  const formik = useFormik<InitialValuesCheckout>({
    initialValues: {
      address_id: address?.id ?? null,
      branch_id: branch?.id ?? null,
      delivery_type: deleveryType,
      payment_method_id: 1,
      items: cartList.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        combo_items: item.combo_items.map((item) => item.id),
      })),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await $axiosPrivate.post("orders/create", values);
        if (data) {
          setFinished(true);
          router.push(`/orders?id=${data.data.id}`);
          setTimeout(() => {
            formik.resetForm();
            dispatch(setClearCartList());
          }, 1000);
        }
      } catch (err) {
        console.error(err);
      }
    },
  });
  useEffect(() => {
    formik.setFieldValue("delivery_type", deleveryType);
  }, [deleveryType]);
  useEffect(() => {
    formik.setFieldValue("address_id", address?.id);
  }, [address]);
  useEffect(() => {
    formik.setFieldValue("branch_id", branch?.id);
  }, [branch]);
  useEffect(() => {
    formik.setFieldValue(
      "items",
      cartList.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        combo_items: item.combo_items.map((item) => item.id),
      }))
    );
  }, [cartList]);

  useEffect(() => {
    if (cartList.length < 1 && !finished) {
      router.push("/");
    }
  }, [cartList]);
  return (
    <div className="my-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t("Home.title")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="-rotate-12">
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{t("Cart.title")}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="-rotate-12">
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("Checkout.title")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-4 max-[990px]:flex-col">
        <div className="flex flex-col gap-2 grow">
          <div>
            <PersonalInfo />
          </div>
          <div className="bg-white rounded-xl p-3">
            {deleveryType === "delivery" ? (
              <h1 className="text-xl font-semibold">
                {t("Profile.orders.card.orderDetails.orderType")}
              </h1>
            ) : (
              <h1 className="text-xl font-semibold">
                {t("Checkout.whichTakeaway")}
              </h1>
            )}
            <div className="mt-3">
              {deleveryType === "delivery" ? (
                <div className="w-full flex justify-between items-center">
                  <AddressPopover
                    open={popover}
                    setOpen={setPopover}
                    setOpenMap={setAddressModal}
                  >
                    <Button
                      variant={"secondary"}
                      className="flex gap-3 items-center justify-between text-sm max-[990px]:w-full"
                      onClick={() => {
                        if (!address) {
                          setAddressModal(true);
                        } else {
                          setPopover(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <LocateIcon className="text-ring" />
                        <span>
                          {address
                            ? getLocalized(address, "name", locale)
                            : t("Header.mapDelivery.title")}
                        </span>
                      </div>
                      <ChevronDown className="size-4" />
                    </Button>
                  </AddressPopover>
                  <Button
                    variant={"secondary"}
                    className="flex gap-3 items-center text-sm max-[990px]:hidden"
                    onClick={() => {
                      if (!address) {
                        setAddressModal(true);
                      } else {
                        setPopover(true);
                      }
                    }}
                  >
                    {t("Buttons.edit")}
                  </Button>
                </div>
              ) : (
                <div className="w-full flex justify-between items-center">
                  <Button
                    variant={"secondary"}
                    className="flex gap-3 items-center justify-start text-sm max-[990px]:w-full"
                    onClick={() => setAddressModal(true)}
                  >
                    <Store className="text-ring" />
                    {branch?.name ?? t("Header.mapTakeAway.title")}
                  </Button>
                  <Button
                    variant={"secondary"}
                    className="flex gap-3 items-center text-sm max-[990px]:hidden"
                    onClick={() => setAddressModal(true)}
                  >
                    {t("Buttons.edit")}
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="bg-white rounded-xl">
              <h1 className="p-3 text-xl font-semibold">
                {t("Checkout.yourProducts")}
              </h1>
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
                      className="object-contain mix-blend-multiply "
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
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 w-96 h-fit max-[990px]:w-full sticky top-24">
          <h1 className="text-xl font-semibold">
            {t("Checkout.payment.title")}
          </h1>
          <div className="flex flex-col gap-4">
            <PaymentType formik={formik} />
            {/* <PromoCode /> */}
            <div>
              <h2 className="text-[16px] font-semibold">
                {t("Checkout.getPriceInside")}
              </h2>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[15px]">{t("Cart.products")}</span>
                <span className="text-[15px] font-medium">
                  {numberSpacing(
                    cartList.reduce(
                      (arr, cerr) => arr + cerr.price * cerr.quantity,
                      0
                    )
                  )}
                  <span className="text-muted-foreground"> UZS</span>
                </span>
              </div>
              <div className="flex gap-2 items-center mt-4">
                <h1 className="grow text-lg font-semibold flex justify-between">
                  <span className="hidden max-[990px]:block">К оплате</span>
                  <span>
                    {numberSpacing(
                      cartList.reduce(
                        (arr, cerr) => arr + cerr.price * cerr.quantity,
                        0
                      )
                    )}{" "}
                    UZS
                  </span>
                </h1>
                <div className="max-[990px]:fixed max-[990px]:bottom-0 max-[990px]:left-0 z-20 max-[990px]:bg-white max-[990px]:w-full max-[990px]:p-4 max-[990px]:py-5">
                  <Button
                    disabled={formik.isSubmitting}
                    onClick={() => formik.handleSubmit()}
                    className="flex justify-between items-center max-[990px]:w-full max-[990px]:py-6 max-[990px]:text-[16px]"
                    type="submit"
                  >
                    {t("Buttons.checkout")}{" "}
                    {formik.isSubmitting && <span className="loader"></span>}
                    <span className="hidden max-[990px]:block text-[16px] max-[990px]:text-lg max-[990px]:font-semibold">
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
          </div>
        </div>
        <DeleveryTypeModal open={addressModal} setOpen={setAddressModal} />
      </div>
    </div>
  );
};

export default Checkouts;
