"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { userKeys } from "@/constants/queryKeys";
import { redirect } from "@/i18n/navigation";
import { $axiosPrivate } from "@/services/AxiosService";
import { userGetUserInfo } from "@/services/queries";
import { formatPhone } from "@/utils/utils";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ErrorMessage, Form, Formik } from "formik";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { PatternFormat } from "react-number-format";
import * as yup from "yup";

const phoneRegExp = /^\+998 \d{2} \d{3} \d{2} \d{2}$/;
const FormSchema = yup.object({
  phone: yup
    .string()
    .matches(phoneRegExp, "Noto‘g‘ri telefon raqami")
    .min(2, "Noto‘g‘ri telefon raqami")
    .required("Noto‘g‘ri telefon raqami"),
  name: yup.string().required("Iltimos ismingizni kiriting!"),
  birthday: yup.string().required("Sanani kiriting!"),
});
const UserDataCard = () => {
  const t = useTranslations();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isError } = userGetUserInfo();
  useEffect(() => {
    if (isError) {
      if (!data?.data) {
        redirect({
          href: "/",
          locale: "",
        }); // yoki "/login"
      }
    }
  }, [data, isError]);
  return (
    <div className="bg-background max-w-[400px] p-3 rounded-xl mt-6">
      <div className="flex justify-between">
        <h1 className="text-lg font-bold">{data?.data.name}</h1>
        <Button
          variant={"secondary"}
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {t("Buttons.edit")}
        </Button>
        <Dialog
          open={open}
          onOpenChange={(e) => {
            setOpen(e);
          }}
        >
          <DialogOverlay className="backdrop-blur-sm !bg-transparent" />
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {t("Profile.modalUser.title")}
              </DialogTitle>
            </DialogHeader>
            <Formik
              enableReinitialize
              initialValues={{
                phone: formatPhone(data?.data.phone ?? ""),
                name: data?.data.name,
                birthday: dayjs(
                  data?.data.birthday?.split(".").reverse().join("-")
                ),
              }}
              validationSchema={FormSchema}
              onSubmit={async (values, { setFieldError }) => {
                try {
                  const { data } = await $axiosPrivate.post("/user-update", {
                    ...values,
                    phone: values.phone?.split(" ").join(""),
                  });
                  if (data) {
                    setOpen(false);
                    qc.invalidateQueries({ queryKey: [userKeys.getUserInfo] });
                  }
                } catch (err) {
                  setFieldError("code", "Noto‘g‘ri kod");
                }
              }}
            >
              {({ errors, touched, setFieldValue, values, isSubmitting }) => (
                <Form className="w-full space-y-4 mt-3">
                  <div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t("Profile.fullName")}
                      </label>
                      <Input
                        name="name"
                        value={values.name ?? ""}
                        onChange={(e) => {
                          setFieldValue("name", e.target.value);
                        }}
                        placeholder="Ism"
                        className={`${
                          errors.name && touched.name ? "border-red-500" : ""
                        } focus-visible:ring-0 h-10`}
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">
                        {t("Profile.birthday")}
                      </label>
                      <div className="relative flex gap-2">
                        <Input
                          type="date"
                          id="birthday"
                          name="birthday"
                          value={
                            values.birthday
                              ? dayjs(values.birthday).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(e) =>
                            setFieldValue("birthday", e.target.value)
                          }
                          className={`bg-background !w-full ${
                            errors.birthday && touched.birthday
                              ? "border-red-500"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="birthday"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">
                        {t("Profile.phone")}
                      </label>
                      <PatternFormat
                        format="+998 ## ### ## ##"
                        name="phone"
                        allowEmptyFormatting
                        customInput={Input}
                        value={values.phone}
                        onChange={(e) => {
                          setFieldValue("phone", e.target.value);
                        }}
                        placeholder="shadcn"
                        className={`${
                          errors.phone && touched.phone ? "border-red-500" : ""
                        } focus-visible:ring-0 h-10`}
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-36 text-white h-11"
                    >
                      {isSubmitting && <span className="loader"></span>}
                      {t("Buttons.save")}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t("Profile.phone")}</span>
          <span>{data?.data.phone}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t("Profile.birthday")}</span>
          <span>{data?.data.birthday}</span>
        </div>
      </div>
    </div>
  );
};

export default UserDataCard;
