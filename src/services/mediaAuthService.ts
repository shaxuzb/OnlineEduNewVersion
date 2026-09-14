import Constants from "expo-constants";
import { resolveApiBaseUrl } from "./apiConfig";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const apiBaseUrl = resolveApiBaseUrl(Constants.expoConfig?.extra?.API_URL);

const normalizeMediaPath = (path: string) =>
  path.trim().replace(/^\/+/, "").replace(/^api\//, "");

export const buildProtectedMediaSource = (path: string, token: string) => ({
  uri: `${apiBaseUrl}/${normalizeMediaPath(path)}`,
  headers: { Authorization: `Bearer ${token}` },
});

const hasAuthStatus = (value: Record<string, unknown>): boolean => {
  const errorCode = value.errorCode;
  if (errorCode === 401 || errorCode === 403) return true;

  const status = value.status;
  if (status === 401 || status === 403) return true;

  const response = isRecord(value.response) ? value.response : null;
  if (response?.status === 401 || response?.status === 403) return true;

  const message = typeof value.message === "string" ? value.message : "";
  return /\b(?:401|403)\b/.test(message);
};

export const isMediaAuthError = (error: unknown): boolean => {
  if (!isRecord(error)) return false;
  if (hasAuthStatus(error)) return true;
  return isRecord(error.error) ? hasAuthStatus(error.error) : false;
};
