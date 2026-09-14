import { CardSmsResponse } from "./purchaseTypes";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const getRecoverableCardSmsResponse = (
  error: unknown,
): CardSmsResponse | null => {
  if (!isRecord(error)) return null;
  const response = isRecord(error.response) ? error.response : null;
  if (response?.status !== 400) return null;

  const data = isRecord(response.data) ? response.data : null;
  const phone = typeof data?.phone === "string" ? data.phone : "";
  return { phone };
};
