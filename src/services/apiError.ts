import axios from "axios";

export const getApiStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError(error)) return error.response?.status;
  if (typeof error !== "object" || error === null) return undefined;

  const response = (error as { response?: { status?: unknown } }).response;
  return typeof response?.status === "number" ? response.status : undefined;
};
