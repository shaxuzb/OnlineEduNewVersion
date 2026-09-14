/// <reference types="jest" />

import {
  isValidCardNumber,
  isValidExpiry,
  normalizeCardNumber,
  normalizeExpiry,
} from "./cardValidation";

describe("card validation", () => {
  it("normalizes spaces from card numbers", () => {
    expect(normalizeCardNumber("4242 4242 4242 4242")).toBe("4242424242424242");
  });

  it("accepts a valid 16-digit Luhn test number", () => {
    expect(isValidCardNumber("4242 4242 4242 4242")).toBe(true);
  });

  it("rejects invalid length and invalid checksum", () => {
    expect(isValidCardNumber("4242")).toBe(false);
    expect(isValidCardNumber("4242 4242 4242 4241")).toBe(false);
  });

  it("normalizes expiry separators", () => {
    expect(normalizeExpiry("12 / 30")).toBe("12/30");
  });

  it("rejects invalid months and expired cards", () => {
    const now = new Date(2026, 8, 14);
    expect(isValidExpiry("13/30", now)).toBe(false);
    expect(isValidExpiry("08/26", now)).toBe(false);
  });

  it("accepts the current month and future dates", () => {
    const now = new Date(2026, 8, 14);
    expect(isValidExpiry("09/26", now)).toBe(true);
    expect(isValidExpiry("12/30", now)).toBe(true);
  });
});
