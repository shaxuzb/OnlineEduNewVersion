import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { AuthToken } from "../types";
import DeviceInfo from "react-native-device-info";
// 🔹 Request interceptor → token qo‘shish
let isRefreshing = false;
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
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
const handleResponseError = async (error: AxiosError) => {
  const originalRequest: any = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    // 🔁 Agar refresh jarayoni allaqachon boshlanib bo‘lgan bo‘lsa:
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return $axiosPrivate(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      // Refresh tokenni olish
      const session = await SecureStore.getItemAsync("session");
      if (!session) throw new Error("No session found");

      const { refreshToken } = JSON.parse(session) as AuthToken;
      if (!refreshToken) throw new Error("No refresh token found");

      // 🔄 Refresh API so‘rov
      const { data } = await axios.post(
        `${Constants.expoConfig?.extra?.API_URL}/account/refresh`,
        {
          refreshToken,
          uniqueId: (await DeviceInfo.getUniqueId()).toString(),
        }
      );

      const newAccessToken = data?.accessToken;
      const newRefreshToken = data?.refreshToken;

      if (!newAccessToken) throw new Error("No access token returned");

      // 🔸 SecureStore ichiga saqlash
      await SecureStore.setItemAsync(
        "session",
        JSON.stringify({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken || refreshToken,
        })
      );

      processQueue(null, newAccessToken);

      // 🔁 Eski so‘rovni yangilangan token bilan qayta yuborish
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return $axiosPrivate(originalRequest);
    } catch (refreshError) {
      console.warn("🔒 Refresh token failed:", refreshError);
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync("session");
      // TODO: foydalanuvchini logout sahifasiga yo‘naltirish kerak bo‘ladi
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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
