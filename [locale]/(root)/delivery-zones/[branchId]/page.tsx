"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { Link, useRouter } from "@/i18n/navigation";
import { useGetBranches } from "@/services/queries";
import { MenuIcon } from "@/utils/CustomIcons";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import React from "react";

const BranchDetail = () => {
  const t = useTranslations();
  const route = useRouter();
  const params = useParams();
  const { data } = useGetBranches();
  const branchDetail = data?.data.find(
    (item) => item.id === Number(params.branchId)
  );
  return (
    <div className="my-7">
      <AppBreadcrumb
        items={[
          {
            label: "Branches.title",
            href: "/branches",
          },
          {
            label: branchDetail?.name ?? "",
            customText: true,
            isCurrent: true,
          },
        ]}
      />
      <div>
        <h1 className="text-3xl font-semibold flex gap-1 items-center">
          <Button
            variant={"ghost"}
            onClick={() => {
              route.back();
            }}
            className="hidden max-[700px]:block active:bg-secondary-foreground/5"
          >
            <ArrowLeft className="size-5" />
          </Button>
          {branchDetail?.name ?? ""}
        </h1>
        <div
          className={`w-full mt-4 bg-white p-4 flex flex-col gap-1 rounded-2xl cursor-pointer border border-secondary max-w-[600px] duration-200`}
        >
          <h1 className="flex items-center gap-2 font-semibold text-xl">
            {branchDetail?.name}
          </h1>
          <div className="text-base text-muted-foreground mt-3">
            {t("Branches.card.filialTime")}:{" "}
            <span className="text-sm text-black">
              {branchDetail?.work_time_start.slice(0, 5)} -{" "}
              {branchDetail?.work_time_end.slice(0, 5)}
            </span>
          </div>
          <div className="text-base text-muted-foreground mt-0.5">
            {t("Branches.card.deliveryTable")}:{" "}
            <span className="text-sm text-black">
              {branchDetail?.work_time_start.slice(0, 5)} -{" "}
              {branchDetail?.work_time_end.slice(0, 5)}
            </span>
          </div>
          <div className="text-base text-muted-foreground mt-0.5">
            {t("Profile.phone")}:{" "}
            <span className="text-sm text-black">+998939987055</span>
          </div>
          <Separator className="my-4" />
          <div className="text-base text-muted-foreground mt-0.5">
            {t("Branches.card.address")}:{" "}
            <span className=" text-black">{branchDetail?.name}</span>
          </div>
          <Separator className="my-4" />
          <Link href={"/"} className="flex gap-4 items-center hover:underline">
            <div className="w-8">
              <MenuIcon />
            </div>
            {t("Branches.card.menu")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BranchDetail;
