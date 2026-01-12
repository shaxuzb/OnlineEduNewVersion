"use client";

import AppBreadcrumb from "@/components/widgets/AppBreadcrumb";
import { Link } from "@/i18n/navigation";
import { useGetSiteInfo } from "@/services/queries";
import { Facebook, Instagram, Youtube } from "@/utils/CustomIcons";
import { Earth, MapPin, PhoneCall } from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
const ContactPage = () => {
  const t = useTranslations();
  const { data } = useGetSiteInfo();
  return (
    <div>
      <AppBreadcrumb
        items={[
          {
            label: "Contacts.title",
            isCurrent: true,
          },
        ]}
      />
      <div>
        <h1 className="text-4xl font-semibold">{t("Contacts.title")}</h1>
        <div className="flex gap-5 mt-3 max-[800px]:flex-col">
          <div className="bg-white grow p-6 rounded-lg flex flex-col gap-10">
            <div className="flex gap-5">
              <PhoneCall className="size-8" />
              <div className="flex flex-col gap-3">
                <span className="text-2xl text-muted-foreground">
                  {t("Contacts.callCEnter")}
                </span>
                <Link href={`tel:${data?.data.phone}`}>
                  <span className="text-xl">{data?.data.phone}</span>
                </Link>
              </div>
            </div>
            <div className="flex gap-5">
              <Earth className="size-8" />
              <div className="flex flex-col gap-3">
                <span className="text-2xl text-muted-foreground">
                  {t("Contacts.socialMedia")}
                </span>
                <div className="flex  items-center gap-3">
                  <Link href={data?.data.instagram ?? ""}>
                    <div className="w-12">
                      <Instagram />
                    </div>
                  </Link>
                  <Link href={data?.data.youtube ?? ""}>
                    <div className="w-12">
                      <Youtube />
                    </div>
                  </Link>
                  <Link href={data?.data.facebook ?? ""}>
                    <div className="w-12">
                      <Facebook />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <MapPin className="size-8" />
              <div className="flex flex-col gap-3">
                <span className="text-2xl text-muted-foreground">
                  {t("Contacts.officeAddress")}
                </span>
                <span className="text-xl">{data?.data.name}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 flex justify-center items-center">
            <div>
              <div className="w-full">
                <QRCodeSVG
                  value={data?.data.telegram ?? ""}
                  size={200}
                  className="w-full"
                  imageSettings={{
                    src: "https://cdn-icons-png.flaticon.com/512/124/124019.png",
                    width: 30,
                    height: 30,
                    excavate: true,
                  }}
                />
              </div>
              <h1 className="text-xl text-center font-medium mt-3">
                Telegram bot
              </h1>
              <Link
                href={data?.data.telegram ?? ""}
                className="text-center mt-1 w-full block"
              >
                @{data?.data.telegram.split("https://t.me/")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
