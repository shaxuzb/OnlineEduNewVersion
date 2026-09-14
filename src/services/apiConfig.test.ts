/// <reference types="jest" />

import { resolveApiBaseUrl } from "./apiConfig";

describe("resolveApiBaseUrl", () => {
  it("normalizes a configured API URL", () => {
    expect(resolveApiBaseUrl("https://example.test/")).toBe(
      "https://example.test/api",
    );
  });

  it("throws for a missing API URL", () => {
    expect(() => resolveApiBaseUrl(undefined)).toThrow(
      "API_URL is not configured",
    );
  });
});
