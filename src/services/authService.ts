import DeviceInfo from "react-native-device-info";
import { AuthToken, UserSubscription } from "../types";
import { $axiosBase, $axiosPrivate } from "./AxiosService";

export const authService = {
  login: async (userName: string, password: string) => {
    const { data } = await $axiosBase.post<AuthToken>("/account/login", {
      userName,
      password,
      uniqueId: (await DeviceInfo.getUniqueId()).toString(),
    });
    return data;
  },

  getCurrentPlan: async (): Promise<UserSubscription> => {
    const { data } = await $axiosPrivate.get<UserSubscription>(
      "subscription-plan/current-plan",
    );
    return data;
  },
};
