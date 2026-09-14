import { getApiStatus } from "@/src/services/apiError";

export const shouldContinueCardOtpAfterSmsError = (error: unknown) =>
  getApiStatus(error) === 400;
