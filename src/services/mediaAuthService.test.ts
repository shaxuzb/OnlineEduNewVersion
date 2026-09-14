/// <reference types="jest" />

jest.mock("expo-constants", () => ({
  expoConfig: { extra: { API_URL: "https://edu-api.example.com/" } },
}));

import { buildProtectedMediaSource, isMediaAuthError } from "./mediaAuthService";

describe("protected media auth", () => {
  it("builds an authenticated API media source", () => {
    expect(buildProtectedMediaSource("/videos/file-1", "token-1")).toEqual({
      uri: "https://edu-api.example.com/api/videos/file-1",
      headers: { Authorization: "Bearer token-1" },
    });
  });

  it("normalizes paths that already start with api", () => {
    expect(buildProtectedMediaSource("api/mock-tests/7/pdf", "token-2")).toEqual({
      uri: "https://edu-api.example.com/api/mock-tests/7/pdf",
      headers: { Authorization: "Bearer token-2" },
    });
  });

  it("recognizes native media auth failures", () => {
    expect(isMediaAuthError({ errorCode: 401 })).toBe(true);
    expect(isMediaAuthError({ error: { errorCode: 401 } })).toBe(true);
    expect(isMediaAuthError({ response: { status: 403 } })).toBe(true);
    expect(isMediaAuthError({ message: "HTTP 401 Unauthorized" })).toBe(true);
    expect(isMediaAuthError({ errorCode: 500 })).toBe(false);
  });
});
