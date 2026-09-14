/// <reference types="jest" />

import { isProtectedMediaReady } from "./mediaPlaybackPolicy";

describe("native protected media readiness", () => {
  it("does not render native media before an authenticated source exists", () => {
    expect(isProtectedMediaReady("", {})).toBe(false);
    expect(
      isProtectedMediaReady("https://edu.example.com/api/videos/1", {}),
    ).toBe(false);
  });

  it("renders only when both uri and authorization header are present", () => {
    expect(
      isProtectedMediaReady("https://edu.example.com/api/videos/1", {
        Authorization: "Bearer token",
      }),
    ).toBe(true);
  });
});
