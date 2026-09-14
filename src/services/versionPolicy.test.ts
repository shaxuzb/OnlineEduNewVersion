/// <reference types="jest" />

import { shouldPresentUpdate, validateStoreUrl } from "./versionPolicy";

describe("version update policy", () => {
  it("always presents a forced update even when the version was dismissed", () => {
    expect(
      shouldPresentUpdate({
        updateAvailable: true,
        forceUpdate: true,
        storeVersion: "2.0.0",
        dismissedVersion: "2.0.0",
      }),
    ).toBe(true);
  });

  it("lets dismissal suppress only an optional update", () => {
    expect(
      shouldPresentUpdate({
        updateAvailable: true,
        forceUpdate: false,
        storeVersion: "2.0.0",
        dismissedVersion: "2.0.0",
      }),
    ).toBe(false);
  });

  it("rejects non-store and non-https update urls", () => {
    expect(validateStoreUrl("ios", "https://apps.apple.com/us/app/x/id1")).toBe(
      "https://apps.apple.com/us/app/x/id1",
    );
    expect(
      validateStoreUrl(
        "android",
        "https://play.google.com/store/apps/details?id=uz.example.app",
      ),
    ).toBe("https://play.google.com/store/apps/details?id=uz.example.app");
    expect(validateStoreUrl("ios", "https://evil.example/app")).toBeNull();
    expect(validateStoreUrl("android", "javascript:alert(1)")).toBeNull();
  });
});
