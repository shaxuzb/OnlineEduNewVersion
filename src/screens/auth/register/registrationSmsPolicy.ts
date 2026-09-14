import { getApiStatus } from "@/src/services/apiError";

export const shouldContinueRegistrationAfterSmsError = (error: unknown) =>
  getApiStatus(error) === 400;
