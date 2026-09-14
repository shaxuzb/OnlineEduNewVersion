/// <reference types="jest" />

jest.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

jest.mock("expo-application", () => ({
  nativeApplicationVersion: "1.0.0",
}));

import VersionService from "./versionService";

describe("VersionService", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("rejects when all remote version sources fail", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as any;

    const request = VersionService.checkForUpdates();
    await jest.runAllTimersAsync();

    await expect(request).rejects.toThrow("offline");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns a real update payload when the remote check succeeds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          latestVersion: "1.1.0",
          updateUrlAndroid:
            "https://play.google.com/store/apps/details?id=uz.example.app",
          updateUrlIos: "https://apps.apple.com/us/app/x/id1",
          forceUpdate: true,
        }),
    }) as any;

    await expect(VersionService.checkForUpdates()).resolves.toEqual({
      currentVersion: "1.0.0",
      storeVersion: "1.1.0",
      updateAvailable: true,
      storeUrl:
        "https://play.google.com/store/apps/details?id=uz.example.app",
      forceUpdate: true,
    });
  });
});
