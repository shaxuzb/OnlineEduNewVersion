import { $axiosBase } from "./AxiosService";

const requestResetCode = async (phone: string) => {
  await $axiosBase.post("account/password-reset/request", { phone });
};

export const passwordResetService = {
  request: requestResetCode,

  // Compatibility alias for the existing resend screen; both flows are public.
  requestPublic: requestResetCode,

  confirm: async (payload: {
    phone: string;
    newPassword: string;
    confirmPassword: string;
    code: string;
  }) => {
    await $axiosBase.post("account/password-reset/confirm", payload);
  },
};
