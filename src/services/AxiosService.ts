import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import DeviceInfo from "react-native-device-info";
import { AuthToken } from "../types";
import { resolveApiBaseUrl } from "./apiConfig";
import { createAuthRefreshManager } from "./authRefreshManager";

let authInvalidationHandler: (() => void) | null = null;

export function subscribeToAuthInvalidation(handler: () => void) {
  authInvalidationHandler = handler;

  return () => {
    if (authInvalidationHandler === handler) {
      authInvalidationHandler = null;
    }
  };
}

const loadSession = async (): Promise<AuthToken | null> => {
  const session = await SecureStore.getItemAsync("session");
  return session ? (JSON.parse(session) as AuthToken) : null;
};

const saveSession = async (session: AuthToken) => {
  await SecureStore.setItemAsync("session", JSON.stringify(session));
};

const clearSession = async () => {
  await SecureStore.deleteItemAsync("session");
};

const baseURL = resolveApiBaseUrl(Constants.expoConfig?.extra?.API_URL);

export const $axiosPrivate = axios.create({
  baseURL,
  timeout: 10000,
});

export const $axiosBase = axios.create({
  baseURL,
  timeout: 10000,
});

const refreshManager = createAuthRefreshManager({
  loadSession,
  saveSession,
  clearSession,
  getUniqueId: () => DeviceInfo.getUniqueId(),
  refreshRequest: async (refreshToken, uniqueId) => {
    const { data } = await $axiosBase.post("/account/refresh", {
      refreshToken,
      uniqueId,
    });
    return data;
  },
  onInvalidated: () => authInvalidationHandler?.(),
});

const addToken = async (config: InternalAxiosRequestConfig) => {
  try {
    const session = await loadSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch (error) {
    console.error("Token parsing error:", error);
  }
  return config;
};

const handleResponseError = async (error: AxiosError) => {
  const originalRequest = error.config as
    | (InternalAxiosRequestConfig & { _retry?: boolean })
    | undefined;

  if (
    error.response?.status !== 401 ||
    !originalRequest ||
    originalRequest._retry
  ) {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const accessToken = await refreshManager.getAccessToken();
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return $axiosPrivate(originalRequest);
  } catch (refreshError) {
    console.warn("Refresh token failed:", refreshError);
    return Promise.reject(refreshError);
  }
};

$axiosPrivate.interceptors.request.use(addToken);
$axiosPrivate.interceptors.response.use(
  (response) => response,
  handleResponseError,
);
