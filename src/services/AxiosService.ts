import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { AuthToken } from "../types";
// 🔹 Request interceptor → token qo‘shish
const addToken = (config: any) => {
  try {
    const userData = JSON.parse(
      String(SecureStore.getItem("session"))
    ) as AuthToken | null;
    if (userData) {
      const { token } = userData;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  } catch (error) {
    console.log(error);

    console.error("Token parsing error:", error);
  }
  return config;
};

// 🔹 Response interceptor → 401 bo‘lsa logout qilish
const handleResponseError = (error: AxiosError) => {
  if (error.response?.status === 401) {
    // store.dispatch(logout());
    //  SecureStore.deleteItemAsync("session")
  }

  return Promise.reject(error);
};

// 🔹 Axios private instance
export const $axiosPrivate = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL,
  timeout: 10000,
});
export const $axiosBase = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL,
  timeout: 10000,
});
$axiosPrivate.interceptors.request.use(addToken);
$axiosPrivate.interceptors.response.use((res) => res, handleResponseError);
