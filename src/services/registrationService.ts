import DeviceInfo from "react-native-device-info";
import { $axiosBase, $axiosPrivate } from "./AxiosService";

interface RegistrationPayload {
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

export const registrationService = {
  register: async (payload: RegistrationPayload) => {
    await $axiosBase.post("account/register", {
      ...payload,
      uniqueId: (await DeviceInfo.getUniqueId()).toString(),
    });
  },

  sendSms: async (phone: string) => {
    await $axiosPrivate.post("sms/send", { phone });
  },

  verifySms: async (phone: string, code: string) => {
    return $axiosBase.post("/sms/verify", { phone, code });
  },

  resendSms: async (phone: string) => {
    await $axiosBase.post("sms/send", { phone });
  },
};
