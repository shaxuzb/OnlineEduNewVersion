/// <reference types="jest" />

import { isProtectedVideoReady } from "./videoPlaybackPolicy";

describe("protected video readiness", () => {
  it("waits for both media uri and bearer header", () => {
    expect(isProtectedVideoReady("", {})).toBe(false);
    expect(isProtectedVideoReady("https://edu.example/video.m3u8", {})).toBe(false);
    expect(
      isProtectedVideoReady("https://edu.example/video.m3u8", {
        Authorization: "Bearer token",
      }),
    ).toBe(true);
  });
});
