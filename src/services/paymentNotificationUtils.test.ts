/// <reference types="jest" />

import {
  getPaymentNotificationKey,
  isSuccessfulPaymentNotification,
  normalizePaymentNotification,
} from "./paymentNotificationUtils";

describe("payment notification payload", () => {
  const successPayload = {
    message: "Obuna uchun to'lov muvaffaqiyatli amalga oshirildi.",
    time: "2026-09-07T11:56:50.5385002Z",
  };

  it("recognizes the backend success payload", () => {
    expect(isSuccessfulPaymentNotification(successPayload)).toBe(true);
    expect(normalizePaymentNotification(successPayload)).toEqual(successPayload);
  });

  it("ignores pending and unrelated notifications", () => {
    expect(
      isSuccessfulPaymentNotification({
        ...successPayload,
        status: "PENDING",
      }),
    ).toBe(false);
    expect(
      isSuccessfulPaymentNotification({
        message: "Profil ma'lumotlari yangilandi.",
      }),
    ).toBe(false);
  });

  it("creates a stable key for duplicate event protection", () => {
    expect(getPaymentNotificationKey(successPayload)).toBe(
      "Obuna uchun to'lov muvaffaqiyatli amalga oshirildi.|2026-09-07T11:56:50.5385002Z",
    );
  });
});
