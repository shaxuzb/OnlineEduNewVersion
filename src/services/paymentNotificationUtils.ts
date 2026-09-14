export interface PaymentNotification {
  message: string;
  time?: string;
  status?: string;
}

export const paymentNotificationCountKey = [
  "notifications",
  "payment-success-count",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const normalizePaymentNotification = (
  payload: unknown,
): PaymentNotification | null => {
  const root = isRecord(payload) ? payload : null;
  const value = root && isRecord(root.data) ? root.data : root;
  if (!value || typeof value.message !== "string") return null;

  const time = typeof value.time === "string" ? value.time : undefined;
  const rawStatus = value.status ?? value.paymentStatus ?? value.state;
  const status = typeof rawStatus === "string" ? rawStatus : undefined;

  return {
    message: value.message,
    ...(time ? { time } : {}),
    ...(status ? { status } : {}),
  };
};

export const isSuccessfulPaymentNotification = (payload: unknown) => {
  const notification = normalizePaymentNotification(payload);
  if (!notification) return false;

  const status = notification.status
    ? normalizeText(notification.status)
    : null;
  const successfulStatuses = new Set([
    "success",
    "successful",
    "succeeded",
    "completed",
    "paid",
  ]);
  if (status && !successfulStatuses.has(status)) return false;

  const message = normalizeText(notification.message);
  const mentionsPayment =
    message.includes("obuna uchun tolov") ||
    (message.includes("obuna") && message.includes("tolov"));
  const confirmsSuccess =
    message.includes("muvaffaqiyatli") ||
    message.includes("payment successful") ||
    message.includes("successful payment");

  return mentionsPayment && confirmsSuccess;
};

export const getPaymentNotificationKey = (payload: unknown) => {
  const notification = normalizePaymentNotification(payload);
  if (!notification) return "";
  return `${notification.message}|${notification.time ?? ""}`;
};

export const getPaymentNotificationContent = (
  notification: PaymentNotification,
) => ({
  title: "To‘lov muvaffaqiyatli amalga oshirildi",
  body: "To‘lov holatini ko‘rish uchun ilovani oching",
  data: {
    type: "payment-success",
    ...(notification.time ? { time: notification.time } : {}),
  },
});
