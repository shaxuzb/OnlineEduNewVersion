/// <reference types="jest" />

import { getApiStatus } from "./apiError";

describe("getApiStatus", () => {
  it("reads response status from an Axios-shaped error", () => {
    expect(getApiStatus({ response: { status: 400 } })).toBe(400);
  });

  it("returns undefined for unrelated errors", () => {
    expect(getApiStatus(new Error("boom"))).toBeUndefined();
  });
});
