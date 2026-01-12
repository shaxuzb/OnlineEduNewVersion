"use client";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orderStatusMap } from "@/constants/orderStatus";
import { useGetOrderDetail } from "@/services/queries";
import { getLocalized, getOrderStatusInfo, numberSpacing } from "@/utils/utils";
import { useRouter } from "@bprogress/next/app";
import { FileText, Link2, Minus, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Fragment, useState } from "react";
import AddComment from "./AddComment";
import { Button } from "@/components/ui/button";
import { useConfirmPayment } from "@/services/mutate";
import { getPaymentMethod } from "@/utils/helpers/paymentMethod";
const historyCustom: {
  label: string;
  isDelivery?: boolean;
  isTakeAway?: boolean;
  code: string;
  statusCodes: { code: string }[];
  id: number;
}[] = [
  // {
  //   label: "Yangi",
  //   code: "ordered",
  //   icon: <FileText className="size-5" />,
  //   isDelivery: true,
  //   id: 1,
  // },
  {
    label: "Profile.orders.status.confirmed",
    statusCodes: [
      {
        code: "confirmed",
      },
      {
        code: "payment_process",
      },
      {
        code: "ordered",
      },
      {
        code: "cancelled",
      },
    ],
    code: "confirmed",
    isDelivery: true,
    isTakeAway: true,
    id: 2,
  },
  {
    label: "Profile.orders.status.ready",
    statusCodes: [
      {
        code: "cooking",
      },
      {
        code: "ready",
      },
    ],
    code: "ready",
    isDelivery: true,
    isTakeAway: true,
    id: 3,
  },
  {
    label: "Profile.orders.status.delivering",
    code: "delivering",
    statusCodes: [
      {
        code: "delivering",
      },
    ],
    isDelivery: true,
    isTakeAway: false,
    id: 4,
  },
  {
    label: "Profile.orders.status.delivered",
    code: "delivered",
    statusCodes: [
      {
        code: "delivered",
      },
    ],
    isDelivery: true,
    isTakeAway: false,
    id: 5,
  },
  {
    label: "Profile.orders.status.waiting_pickup",
    code: "waiting_pickup",
    statusCodes: [
      {
        code: "waiting_pickup",
      },
      {
        code: "picked_up",
      },
    ],
    isDelivery: false,
    isTakeAway: true,
    id: 6,
  },
];

const OrderDetail = ({ id }: { id: number }) => {
  const locale = useLocale();
  const route = useRouter();
  const [commentModal, setCommentModal] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  const t = useTranslations();
  const mutation = useConfirmPayment();
  const { data, isLoading, isFetching } = useGetOrderDetail(id);

  const handlePay = async (productId: number, paymentCode: string) => {
    mutation.mutate(
      { productId, paymentCode },
      {
        onSuccess: (data) => {
          // window.location.href = data.url;
          window.open(data.url, "_blank");
        },
      }
    );
  };
  if (isLoading || isFetching) {
    return (
      <div className="flex">
        <span className="loader !size-7 !border-ring !border-b-transparent"></span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">
            {t("Profile.orders.card.order")} №{data?.data.id}
          </h1>
          <span className="text-muted-foreground">{data?.data.created_at}</span>
        </div>
        <div>
          <div className="flex items-center gap-1 justify-center mx-auto mt-3">
            <div
              className={`w-10 h-10 bg-secondary rounded-full flex justify-center items-center ${"!bg-ring !text-white"}`}
            >
              <FileText className="size-5" />
            </div>
            {historyCustom
              .filter((filter) =>
                data?.data.delivery_type === "delivery"
                  ? filter.isDelivery
                  : filter.isTakeAway
              )
              .map((item, index) => {
                const histories = data?.data.histories ?? [];

                // shu item statusCodes ichidan biri histories da bormi?
                const matchedHistory = item.statusCodes.find(
                  (s) => s.code === data?.data.status
                );
                const isCancelled = data?.data.status === "cancelled";

                return (
                  <Fragment key={index}>
                    <Minus
                      strokeWidth={"5"}
                      width={18}
                      className="text-muted-foreground"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-10 h-10 rounded-full bg-secondary flex justify-center items-center
                ${
                  item.id === 2 && isCancelled
                    ? "!bg-red-500 text-white"
                    : matchedHistory ||
                      histories.some((itemd) => itemd.status === item.code)
                    ? "!bg-ring text-white"
                    : ""
                }
              `}
                        >
                          {
                            (orderStatusMap as any)[
                              matchedHistory?.code ?? item.code
                            ].icon
                          }
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        className="bg-[#344054] text-white rounded-xs text-sm p-1 px-2 mt-3 !pointer-events-none"
                      >
                        {
                          (orderStatusMap as any)[
                            matchedHistory?.code ?? item.code
                          ].label
                        }
                      </TooltipContent>
                    </Tooltip>
                  </Fragment>
                );
              })}
          </div>
          <span className="text-muted-foreground text-sm text-center w-full block mt-1">
            {t(getOrderStatusInfo(data?.data.status ?? "ordered").name_uz)}
          </span>
        </div>
        <Separator className="my-3" />
        <div className={`flex gap-2`}>
          {data?.data.paymentMethod.id !== 1 &&
            data?.data.paymentStatus === "unpaid" && (
              <div
                className={`bg-secondary rounded-lg p-1 flex flex-col justify-center items-center gap-1 w-full cursor-pointer  ${
                  mutation.isPending && "opacity-80 pointer-events-none"
                }`}
                onClick={() => {
                  handlePay(id, data?.data.paymentMethod.name || "");
                }}
              >
                {mutation.isPending && (
                  <span
                    className={`loader !border-black !border-b-transparent !border-2 absolute ${
                      mutation.isPending && "opacity-80"
                    }`}
                  ></span>
                )}
                <Link2 className={`${mutation.isPending && "opacity-0"}`} />
                <span
                  className={`${mutation.isPending && "opacity-0"} text-xs`}
                >
                  {t("Profile.orders.card.linkToPayment")}
                </span>
              </div>
            )}
          <div
            onClick={() => route.push("contacts")}
            className="bg-secondary rounded-lg p-1 flex flex-col justify-center items-center gap-1 w-full cursor-pointer"
          >
            <User />
            <span className="text-xs text-nowrap">{t("Support.title")}</span>
          </div>
          {/* <div className="bg-secondary rounded-lg p-1 flex flex-col justify-center items-center gap-1 w-full cursor-pointer">
            <MessageCircle />
            <span className="text-xs">Izoh qoldirish</span>
          </div> */}
        </div>
      </div>
      <div className="bg-white p-4 pb-0 rounded-xl">
        <h1 className="text-lg font-semibold">
          {t("Profile.orders.card.orderDetails.title")}
        </h1>
        <div>
          <div className="flex justify-between items-center py-4 border-b">
            <h2 className="text-muted-foreground">
              {t("Profile.orders.card.orderDetails.address")}
            </h2>
            <span className="font-medium">
              {data?.data.address
                ? getLocalized(data?.data.address || {}, "name", locale)
                : data?.data.branch?.name}
            </span>
          </div>
          {data?.data.branch && (
            <div className="flex justify-between items-center py-4 border-b">
              <h2 className="text-muted-foreground">
                {t("Profile.orders.card.orderDetails.filial")}
              </h2>
              <span className="font-medium">{data?.data.branch?.name}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-4">
            <h2 className="text-muted-foreground">
              {t("Profile.orders.card.orderDetails.orderType")}
            </h2>
            <span className="font-medium">
              {data?.data.delivery_type === "delivery"
                ? t("Buttons.delivery")
                : t("Buttons.takeaway")}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 pb-0 rounded-xl">
        <h1 className="text-lg font-semibold">
          {t("Profile.orders.card.orderList.title")}
        </h1>
        <div>
          {data?.data.items.map((item, index) => (
            <div className="flex items-center justify-between" key={index}>
              <div className="flex items-center py-4 gap-3">
                <div className="aspect-[1_/_1] w-11 flex justify-center items-center rounded-lg overflow-hidden relative">
                  <div className="overlay"></div>
                  <Image
                    src={`${item.images.product}`}
                    width={"400"}
                    height={"500"}
                    className="object-contain mix-blend-multiply "
                    alt="product image"
                  />
                </div>
                <div className="flex flex-col gap-0">
                  <span className="font-medium">
                    {getLocalized(item, "name", locale)}
                  </span>
                  <span>
                    <span className="text-muted-foreground">
                      {item.quantity} x
                    </span>{" "}
                    {numberSpacing(item.price)} UZS
                  </span>
                </div>
              </div>
              <Button
                variant={"outline"}
                onClick={() => {
                  setProductId(item.id);
                  setCommentModal(true);
                }}
              >
                {t("Comment.addComment")}
              </Button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-4 rounded-xl">
        <h1 className="text-lg font-semibold">
          {t("Profile.orders.card.paymentDetail.title")}
        </h1>
        <div className="mt-3">
          <div className="flex justify-between items-center py-1">
            <h2 className="">
              {t("Profile.orders.card.paymentDetail.paymentType")}
            </h2>
            <span className="font-medium">
              {data?.data.paymentMethod.name === "cash"
                ? t(getPaymentMethod(data?.data.paymentMethod.name))
                : getPaymentMethod(data?.data.paymentMethod.name)}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <h2 className="">
              {t("Profile.orders.card.paymentDetail.productPrice")}
            </h2>
            <span className="font-medium">
              {numberSpacing(data?.data.total_price ?? 0)} UZS
            </span>
          </div>
          {/* <div className="flex justify-between items-center py-1">
            <h2 className="">
              {t("Profile.orders.card.paymentDetail.deliveryPrice")}
            </h2>
            <span className="font-medium">{numberSpacing(10000)} UZS</span>
          </div> */}
        </div>
        <div className="flex justify-between items-center mt-2">
          <h2 className="font-bold text-lg">{t("Global.total")}</h2>
          <span className="font-medium text-lg">
            {numberSpacing(data?.data.total_price ?? 0)} UZS
          </span>
        </div>
      </div>
      <AddComment
        open={commentModal}
        setOpen={setCommentModal}
        productId={productId}
        setProductId={setProductId}
      />
    </div>
  );
};

export default OrderDetail;
