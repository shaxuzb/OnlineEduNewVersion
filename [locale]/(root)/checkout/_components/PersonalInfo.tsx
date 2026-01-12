"use client";

import { Input } from "@/components/ui/input";
import { redirect } from "@/i18n/navigation";
import { $axiosPrivate } from "@/services/AxiosService";
import { userGetUserInfo } from "@/services/queries";
import dayjs from "dayjs";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
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

type FormValues = {
  phone: string;
  name: string;
  birthday: string;
};
const PersonalInfo = () => {
  const { data,isError } = userGetUserInfo();
  const t = useTranslations();
  const formik = useFormik<FormValues>({
    initialValues: {
      phone: data?.data.phone?.slice(4) ?? "",
      name: data?.data.name ?? "",
      birthday: dayjs(
        data?.data.birthday?.split(".").reverse().join("-")
      ).format("YYYY-MM-DD"),
    },
    validationSchema: FormSchema,
    onSubmit: async (values, { setFieldError }) => {
      try {
        const { data } = await $axiosPrivate.post("/auth/verify-code", values);
        if (data) {
          // modal yopish yoki boshqa action
        }
      } catch (err) {
        setFieldError("code", "Noto‘g‘ri kod");
      }
    },
  });
  useEffect(() => {
    if (!formik.values.name) {
      formik.setFieldValue("name", data?.data.name);
    }
    if (!formik.values.phone) {
      formik.setFieldValue("phone", data?.data.phone.slice(4));
    }
    if (!formik.values.birthday) {
      formik.setFieldValue("birthday", data?.data.birthday);
    }
  }, [data, formik.values.name, formik.values.phone, formik.values.birthday]);
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
    <div className="bg-white rounded-xl p-3">
      <h1 className="text-xl font-semibold">
        {t("Checkout.personalInformation.title")}
      </h1>
      <div>
        <form onSubmit={formik.handleSubmit} className="w-full space-y-4 mt-3">
          <div className="grid grid-cols-2 gap-4 max-[750px]:grid-cols-1">
            <div className="cursor-no-drop">
              <label className="block text-sm font-medium mb-1">
                {t("Profile.fullName")}
              </label>
              <Input
                name="name"
                disabled
                value={formik.values.name ?? ""}
                onChange={(e) => {
                  formik.setFieldValue("name", e.target.value);
                }}
                placeholder={t("Profile.fullName")}
                className={`${
                  formik.errors.name && formik.touched.name
                    ? "border-red-500"
                    : ""
                } focus-visible:ring-0 h-10`}
              />
            </div>

            <div className="cursor-no-drop">
              <label className="block text-sm font-medium mb-1">
                {t("Profile.phone")}
              </label>
              <PatternFormat
                format="+998 ## ### ## ##"
                name="phone"
                allowEmptyFormatting
                customInput={Input}
                value={formik.values.phone}
                onChange={(e) => {
                  formik.setFieldValue("phone", e.target.value);
                }}
                disabled
                placeholder={t("Profile.phone")}
                className={`${
                  formik.errors.phone && formik.touched.phone
                    ? "border-red-500"
                    : ""
                } focus-visible:ring-0 h-10`}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
