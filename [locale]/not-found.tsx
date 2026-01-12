"use client";

import { Button } from "@/components/ui/button";
import notFound from "@/assets/images/notFound.svg";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
export default function NotFound() {
  const t = useTranslations();
  const router = useRouter();
  return (
    <div className="flex items-center w-full flex-col pt-10">
      <Image src={notFound} alt="notFound" />
      <h1 className="text-7xl font-bold text-ring uppercase">
        {t("NotFound.title")}
      </h1>
      <p>{t("NotFound.description")}</p>
      <Button className="mt-5 text-base" onClick={() => router.push("/")}>
        {t("NotFound.returnHome")}
      </Button>
    </div>
  );
}
