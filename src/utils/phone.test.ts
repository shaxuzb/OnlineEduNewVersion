import {
  formatUzbekPhone,
  isCompleteUzbekPhone,
  normalizeUzbekPhone,
} from "./phone";
import { describe, expect, it } from "@jest/globals";

describe("Uzbek phone formatting", () => {
  it("formats local digits for display", () => {
    expect(formatUzbekPhone("901234567")).toBe("+998 90 123 45 67");
  });

  it("normalizes formatted values for the API", () => {
    expect(normalizeUzbekPhone("+998 90 123 45 67")).toBe("+998901234567");
    expect(isCompleteUzbekPhone("+998 90 123 45 67")).toBe(true);
  });

  it("limits incomplete values to the country prefix and entered digits", () => {
    expect(formatUzbekPhone("+998 90 12")).toBe("+998 90 12");
    expect(isCompleteUzbekPhone("+998 90 12")).toBe(false);
  });
});
