import { AuthUserData } from "../types";
import { $axiosPrivate } from "./AxiosService";

export const userService = {
  // Get current user profile
  getUser: async (): Promise<AuthUserData> => {
    const response = await $axiosPrivate.get("/users");
    return response.data;
  },
};
