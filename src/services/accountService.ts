import { $axiosPrivate } from "./AxiosService";

export const accountService = {
  deleteMyAccount: async () => {
    await $axiosPrivate.delete("/account/my-account");
  },
};
