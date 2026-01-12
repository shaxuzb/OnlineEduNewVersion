"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FormikProps } from "formik";
import { InitialValuesCheckout } from "./Checkouts";
import { useTranslations } from "next-intl";
import { useGetPaymentMethod } from "@/services/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { getPaymentMethod } from "@/utils/helpers/paymentMethod";

const PaymentType = ({
  formik,
}: {
  formik: FormikProps<InitialValuesCheckout>;
}) => {
  const t = useTranslations();
  const { data, isLoading, isFetched } = useGetPaymentMethod();
  const [paymentModal, setPaymentModal] = useState(false);
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="w-11 h-11" />
          ) : (
            <div className="!border !aspect-square w-11 !rounded-md p-1">
              <Image
                src={
                  data?.find(
                    (item) => item.id === formik.values.payment_method_id
                  )?.images.payment ?? ""
                }
                width={200}
                height={200}
                alt={
                  data?.find(
                    (item) => item.id === formik.values.payment_method_id
                  )?.name ?? ""
                }
                className="object-cover"
              />
            </div>
          )}
          <span className="">
            {isLoading ? (
              <Skeleton className="w-16 h-2" />
            ) : data?.find(
                (item) =>
                  item.id === formik.values.payment_method_id && item.id === 1
              ) ? (
              t(
                getPaymentMethod(
                  data?.find(
                    (item) => item.id === formik.values.payment_method_id
                  )?.name
                )
              )
            ) : (
              getPaymentMethod(
                data?.find(
                  (item) => item.id === formik.values.payment_method_id
                )?.name
              )
            )}
          </span>
        </div>
        <Button
          disabled={isLoading}
          variant={"secondary"}
          onClick={() => setPaymentModal(true)}
        >
          {t("Buttons.edit")}
        </Button>
      </div>
      <Dialog open={paymentModal} onOpenChange={setPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Checkout.payment.title")}</DialogTitle>
          </DialogHeader>
          <div>
            <div>
              <RadioGroup
                value={formik.values.payment_method_id.toString()}
                onValueChange={(e) => {
                  formik.setFieldValue("payment_method_id", Number(e), true);
                }}
                className="w-full flex flex-col gap-0"
              >
                {data?.map((item, index) => (
                  <div key={item.id} className="w-full">
                    <Label
                      htmlFor={item.id.toString()}
                      className={`flex w-full justify-between items-center cursor-pointer px-2 py-3 ${
                        index !== 0 && "border-t"
                      }`}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="aspect-square w-11 rounded-md p-1">
                          <Image
                            src={item.images.payment ?? ""}
                            width={200}
                            height={200}
                            alt={item.name ?? ""}
                            className="object-cover"
                          />
                        </div>
                        {item.id === 1
                          ? t(getPaymentMethod(item.name ?? ""))
                          : getPaymentMethod(item.name)}
                      </div>
                      <RadioGroupItem
                        value={item.id.toString()}
                        id={item.id.toString()}
                      />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button
              className="w-full py-6 mt-4"
              onClick={() => setPaymentModal(false)}
            >
              {t("Buttons.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentType;
