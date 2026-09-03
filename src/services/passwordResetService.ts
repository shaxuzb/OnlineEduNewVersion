import { $axiosBase, $axiosPrivate } from "./AxiosService";

export const passwordResetService = {
  request: async (phone: string) => {
    await $axiosPrivate.post("account/password-reset/request", { phone });
  },

  requestPublic: async (phone: string) => {
    await $axiosBase.post("account/password-reset/request", { phone });
  },

  confirm: async (payload: {
    phone: string;
    newPassword: string;
    confirmPassword: string;
    code: string;
  }) => {
    await $axiosBase.post("account/password-reset/confirm", payload);
  },
};
