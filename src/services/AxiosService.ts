import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import DeviceInfo from "react-native-device-info";
import { AuthToken } from "../types";

// 🔹 Queue management for refresh token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// 🔹 Request interceptor - add token
const addToken = async (config: InternalAxiosRequestConfig) => {
  try {
    const session = await SecureStore.getItemAsync("session");
    if (session) {
      const userData = JSON.parse(session) as AuthToken;
      if (userData?.token) {
        config.headers.Authorization = `Bearer ${userData.token}`;
      }
    }
  } catch (error) {
    console.error("Token parsing error:", error);
  }
  return config;
};

// 🔹 Response interceptor - handle 401
const handleResponseError = async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  if (
    error.response?.status === 401 &&
    originalRequest &&
    !originalRequest._retry
  ) {
    originalRequest._retry = true;

    // 🔁 Agar refresh jarayoni allaqachon boshlanib bo'lsa
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
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

      const authData = JSON.parse(session) as AuthToken;
      const refreshToken = authData.refreshToken;

      if (!refreshToken) throw new Error("No refresh token found");

      // 🔄 Refresh API so'rov
      const { data } = await $axiosBase.post(`/account/refresh`, {
        refreshToken,
        uniqueId: await DeviceInfo.getUniqueId(),
      });

      const newAccessToken = data?.accessToken || data?.token;
      const newRefreshToken = data?.refreshToken;

      if (!newAccessToken) throw new Error("No access token returned");

      // 🔸 Session ma'lumotlarini yangilash (barcha ma'lumotlarni saqlab qolgan holda)
      const updatedSession: AuthToken = {
        ...authData, // eski barcha ma'lumotlarni saqlab qolish
        token: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
      };

      // 🔸 SecureStore yangilash
      await SecureStore.setItemAsync("session", JSON.stringify(updatedSession));

      // 🔁 Navbatdagi so'rovlarni yangi token bilan bajarish
      processQueue(null, newAccessToken);

      // 🔁 Eski so'rovni yangilangan token bilan qayta yuborish
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return $axiosPrivate(originalRequest);
    } catch (refreshError) {
      console.warn("🔒 Refresh token failed:", refreshError);

      // 🔁 Navbatdagi so'rovlarni rad etish
      processQueue(refreshError, null);

      // 🔐 Sessionni tozalash
      await SecureStore.deleteItemAsync("session");

      // TODO: Foydalanuvchini login sahifasiga yo'naltirish
      // Masalan: navigation.navigate('Login');

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
};

// 🔹 Axios instances
export const $axiosPrivate = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL+"/api",
  timeout: 10000,
});

export const $axiosBase = axios.create({
  baseURL: Constants.expoConfig?.extra?.API_URL+"/api",
  timeout: 10000,
});

// 🔹 Interceptorlarni ulash
$axiosPrivate.interceptors.request.use(addToken);
$axiosPrivate.interceptors.response.use(
  (response) => response,
  handleResponseError
);
