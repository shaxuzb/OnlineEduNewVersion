"use client";
import DeleveryMap from "@/components/navbar/components/deleverytype/components/DeleveryMap";
import { Button } from "@/components/ui/button";
import { useGetAddressInfo } from "@/services/queries";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useState } from "react";
import DeleteAddressModal from "./DeleteAddressModal";

// const phoneRegExp = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;

const UserAddress = () => {
  const locale = useLocale();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [addressData, setAddressData] = useState<{
    cordinate: number[];
    id: number | null;
  }>({ cordinate: [41.311158, 69.279737], id: null });
  const { data, isLoading, isFetching } = useGetAddressInfo(true);

  return (
    <div className="bg-background max-w-[400px] p-3 rounded-xl mt-6">
      <div className="flex justify-between">
        <h1 className="text-lg font-bold">{t("Profile.addresses")}</h1>
        <Button
          variant={"secondary"}
          className="cursor-pointer"
          onClick={() => {
            setOpenType(true);
            setAddressData({
              cordinate: [41.311158, 69.279737],
              id: null,
            });
          }}
        >
          {t("Buttons.addAddress")}
        </Button>
      </div>
      <div className="flex flex-col">
        {data?.data && data?.data.length > 0
          ? data.data.map((address: any, index) => (
              <div
                key={index + 1}
                className="flex items-center justify-between w-full border-t py-2"
              >
                <span className="text-[15px]">{address[`name_${locale}`]}</span>
                <div className="flex">
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      setOpenType(true);
                      setAddressData({
                        cordinate: [Number(address.lat), Number(address.long)],
                        id: address.id,
                      });
                    }}
                  >
                    <Pencil className="size-4" fill="#71717b" color="white" />
                  </Button>
                  <Button
                    onClick={() => {
                      setOpen(true);
                      setAddressData({
                        id: address.id,
                        cordinate: [41.311158, 69.279737],
                      });
                    }}
                    variant={"ghost"}
                  >
                    <Trash2 className="size-3.5" color="#ec5962" />
                  </Button>
                  {addressData.id && (
                    <DeleteAddressModal
                      open={open}
                      setOpen={setOpen}
                      id={addressData.id}
                    />
                  )}
                </div>
              </div>
            ))
          : "Epmty"}
      </div>

      {openType && (
        <DeleveryMap
          open={openType}
          coordinate={addressData.cordinate}
          id={addressData.id}
          setOpen={setOpenType}
        />
      )}
    </div>
  );
};

export default UserAddress;
