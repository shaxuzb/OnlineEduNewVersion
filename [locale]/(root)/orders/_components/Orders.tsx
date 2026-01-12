"use client";

import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import OrderDetail from "./OrderDetail";
import { useGetOrders } from "@/services/queries";
import { getOrderStatusInfo, numberSpacing } from "@/utils/utils";
import { useTranslations } from "next-intl";
import { EmptyOrder } from "@/utils/CustomIcons";
const Orders = () => {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isFetching } = useGetOrders();
  if (isLoading || isFetching) {
    return (
      <div className="flex-1 justify-center items-center w-full h-full flex">
        <span className="loader !border-ring !border-b-transparent !size-12"></span>
      </div>
    );
  }
  if (!(data?.data && data?.data.length > 0)) {
    return (
      <div className="w-full h-[500px] flex justify-center items-center">
        <div className="flex flex-col justify-center items-center">
          <div className="w-32">
            <EmptyOrder />
          </div>
          <h1 className="text-2xl font-medium mt-3">
            {t("Profile.orders.emptyOrder.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("Profile.orders.emptyOrder.description")}
          </p>
          <Link href={"/"} className="mt-6">
            <Button>{t("Profile.orders.emptyOrder.textButton")}</Button>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="my-4">
      <AppBreadcrumb
        items={[
          {
            label: "Home.title",
            isCurrent: true,
          },
        ]}
      />
      <div className="mt-3">
        <h1 className="text-3xl font-bold max-[770px]:hidden">
          {searchParams.get("id") && (
            <Button
              variant={"ghost"}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("id");
                router.push(`?${params.toString()}`);
              }}
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}{" "}
          {t("Profile.orders.title")}
        </h1>
        {searchParams.get("id") ? (
          <h1 className="text-3xl font-bold hidden max-[770px]:block">
            <Button
              variant={"ghost"}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("id");
                router.push(`?${params.toString()}`);
                // router.back();
              }}
            >
              <ArrowLeft className="size-5" />
            </Button>{" "}
            {t("Profile.orders.card.order")} №
            {
              data?.data.find(
                (item) => item.id === Number(searchParams.get("id"))
              )?.id
            }
          </h1>
        ) : (
          <h1 className="text-3xl font-bold hidden max-[770px]:block">
            {t("Profile.orders.card.order")}
          </h1>
        )}
      </div>
      <div className="grid grid-cols-2 gap-5 mt-5 max-[770px]:grid-cols-1">
        <div
          className={`${
            searchParams.get("id") && "max-[770px]:hidden"
          } flex flex-col gap-4`}
        >
          {data?.data
            .filter((item) =>
              searchParams.get("id")
                ? item.id === Number(searchParams.get("id"))
                : item
            )
            .map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`?id=${item.id}`)}
                className={`flex justify-between items-center bg-white px-4 py-6 rounded-xl border-2 border-transparent hover:border-ring duration-200 cursor-pointer ${
                  item.id === Number(searchParams.get("id")) && "!border-ring"
                }`}
              >
                <div className="flex flex-col justify-end items-start gap-2">
                  <h1 className="text-2xl font-bold">
                    <span className="max-[920px]:hidden">
                      {t("Profile.orders.card.order")}{" "}
                    </span>
                    {item.id}
                  </h1>
                  <span className="text-muted-foreground">
                    {item.created_at}
                  </span>
                </div>
                <div className="flex flex-col justify-end items-end gap-2">
                  <h2 className="text-xl font-bold">
                    {numberSpacing(item.total_price)} UZS
                  </h2>
                  <div
                    className={`text-sm px-3 rounded-lg`}
                    style={{
                      backgroundColor: getOrderStatusInfo(item.status, 0.2)
                        .background,
                    }}
                  >
                    {t(getOrderStatusInfo(item.status).name_uz)}
                  </div>
                </div>
              </div>
            ))}
        </div>
        {searchParams.get("id") && (
          <OrderDetail id={Number(searchParams.get("id"))} />
        )}
      </div>
    </div>
  );
};

export default Orders;
