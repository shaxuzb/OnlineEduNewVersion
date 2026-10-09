/// <reference types="jest" />

import {
  createAuthRefreshManager,
  isAuthSessionRejected,
} from "./authRefreshManager";

const session = {
  token: "old-token",
  refreshToken: "old-refresh",
  user: { id: 1 },
} as any;

describe("auth refresh manager", () => {
  it("shares one refresh request across concurrent callers", async () => {
    let release!: (value: {
      accessToken: string;
      refreshToken: string;
    }) => void;

    const refreshRequest = jest.fn(
      () =>
        new Promise<{ accessToken: string; refreshToken: string }>((resolve) => {
          release = resolve;
        }),
    );

    const saveSession = jest.fn().mockResolvedValue(undefined);
    const manager = createAuthRefreshManager({
      loadSession: jest.fn().mockResolvedValue(session),
      saveSession,
      clearSession: jest.fn().mockResolvedValue(undefined),
      getUniqueId: jest.fn().mockResolvedValue("device-id"),
      refreshRequest,
      onInvalidated: jest.fn(),
    });

    const first = manager.getAccessToken();
    const second = manager.getAccessToken();

    // The request only starts after the session and device id are loaded.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    release({ accessToken: "new-token", refreshToken: "new-refresh" });

    await expect(Promise.all([first, second])).resolves.toEqual([
      "new-token",
      "new-token",
    ]);
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(saveSession).toHaveBeenCalledTimes(1);
  });

  it("invalidates the session once when a shared refresh fails", async () => {
    const clearSession = jest.fn().mockResolvedValue(undefined);
    const onInvalidated = jest.fn();
    const refreshRequest = jest
      .fn()
      .mockRejectedValue(
        Object.assign(new Error("expired"), { response: { status: 401 } }),
      );

    const manager = createAuthRefreshManager({
      loadSession: jest.fn().mockResolvedValue(session),
      saveSession: jest.fn().mockResolvedValue(undefined),
      clearSession,
      getUniqueId: jest.fn().mockResolvedValue("device-id"),
      refreshRequest,
      onInvalidated,
    });

    const first = manager.getAccessToken();
    const second = manager.getAccessToken();

    await expect(first).rejects.toThrow("expired");
    await expect(second).rejects.toThrow("expired");
    expect(refreshRequest).toHaveBeenCalledTimes(1);
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(onInvalidated).toHaveBeenCalledTimes(1);
  });

  it("keeps the session when the refresh fails for a network reason", async () => {
    const clearSession = jest.fn().mockResolvedValue(undefined);
    const onInvalidated = jest.fn();

    const manager = createAuthRefreshManager({
      loadSession: jest.fn().mockResolvedValue(session),
      saveSession: jest.fn().mockResolvedValue(undefined),
      clearSession,
      getUniqueId: jest.fn().mockResolvedValue("device-id"),
      refreshRequest: jest.fn().mockRejectedValue(new Error("Network Error")),
      onInvalidated,
    });

    await expect(manager.getAccessToken()).rejects.toThrow("Network Error");
    expect(clearSession).not.toHaveBeenCalled();
    expect(onInvalidated).not.toHaveBeenCalled();
  });

  it("ends the session when there is no refresh token to use", async () => {
    const clearSession = jest.fn().mockResolvedValue(undefined);
    const onInvalidated = jest.fn();

    const manager = createAuthRefreshManager({
      loadSession: jest.fn().mockResolvedValue({ ...session, refreshToken: "" }),
      saveSession: jest.fn().mockResolvedValue(undefined),
      clearSession,
      getUniqueId: jest.fn().mockResolvedValue("device-id"),
      refreshRequest: jest.fn(),
      onInvalidated,
    });

    await expect(manager.getAccessToken()).rejects.toThrow(
      "No refresh token found",
    );
    expect(clearSession).toHaveBeenCalledTimes(1);
    expect(onInvalidated).toHaveBeenCalledTimes(1);
  });

  it("treats only client errors from the server as a rejected session", () => {
    expect(isAuthSessionRejected({ response: { status: 400 } })).toBe(true);
    expect(isAuthSessionRejected({ response: { status: 401 } })).toBe(true);
    expect(isAuthSessionRejected({ response: { status: 500 } })).toBe(false);
    expect(isAuthSessionRejected({ code: "ECONNABORTED" })).toBe(false);
    expect(isAuthSessionRejected(new Error("Network Error"))).toBe(false);
  });
});
