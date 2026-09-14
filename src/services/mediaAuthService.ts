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

export const isMediaAuthError = (error: unknown): boolean => {
  if (!isRecord(error)) return false;

  const errorCode = error.errorCode;
  if (errorCode === 401 || errorCode === 403) return true;

  const response = isRecord(error.response) ? error.response : null;
  if (response?.status === 401 || response?.status === 403) return true;

  const message = typeof error.message === "string" ? error.message : "";
  return /\b(?:401|403)\b/.test(message);
};
