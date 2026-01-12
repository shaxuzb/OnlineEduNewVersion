"use client";
import { Button } from "@/components/ui/button";
import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { useGetServices } from "@/services/queries";
import { getLocalized } from "@/utils/utils";
import { useRouter } from "@bprogress/next/app";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { notFound } from "next/navigation";
import React, { useState } from "react";

const Service: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading, isFetching } = useGetServices();
  const route = useRouter();
  const handleRoute = (item: any) => {
    route.push(`/service-details/${item.id}`);
  };
  if (isLoading || isFetching) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <span className="loader !border-ring !border-b-transparent !size-20"></span>
      </div>
    );
  }
  if (!(data && data.data)) {
    return notFound();
  }
  return (
    <div className="w-[1000px] max-[1000px]:w-full px-4 mx-auto flex-1">
      <AppBreadcrumb
        items={[
          {
            label: "Service.title",
            isCurrent: true,
          },
        ]}
      />
      <div className="flex flex-col gap-6 w-full">
        {data.data.map((item: any, i: number) => (
          <div
            key={item.id}
            className={`flex items-center gap-9 max-[800px]:flex-col ${
              i % 2 === 0 ? "flex-row-reverse" : ""
            }`}
          >
            <div className="shrink-0 aspect-[6/5] max-[800px]:w-full rounded-2xl overflow-hidden w-1/2 bg-secondary">
              <Image
                src={`${item.images.original}`}
                width={400}
                height={400}
                alt="weasdad"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="grow">
              <h1 className="text-5xl">
                {getLocalized(item, "name", locale)}
                {/* Lorem ipsum dolor sit. */}
              </h1>
              <p className="text-base mt-2">
                {getLocalized(item, "description", locale)}
                {/* Lorem ipsum dolor sit amet, consectetur adipisicing elit. Libero
                ea explicabo veniam provident alias! Aut tempora asperiores
                placeat consequatur nemo, vitae cupiditate quod nobis minima
                quas doloremque, quis, ipsa natus! */}
              </p>
              <Button onClick={() => handleRoute(item)} className="mt-3">
                {t("Service.button")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Service;
