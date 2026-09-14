import { getApiStatus } from "../../../services/apiError";

export const shouldTreatResetRequestAsAlreadySent = (error: unknown) =>
  getApiStatus(error) === 400;
