/// <reference types="jest" />

import { isNetworkUsable } from "./networkState";

describe("isNetworkUsable", () => {
  it("treats an explicitly disconnected transport as offline", () => {
    expect(
      isNetworkUsable({ isConnected: false, isInternetReachable: true }),
    ).toBe(false);
  });

  it("treats failed internet reachability as offline", () => {
    expect(
      isNetworkUsable({ isConnected: true, isInternetReachable: false }),
    ).toBe(false);
  });

  it("keeps unknown reachability usable while transport is connected", () => {
    expect(
      isNetworkUsable({ isConnected: true, isInternetReachable: null }),
    ).toBe(true);
  });

  it("does not mark unknown initial network state offline", () => {
    expect(
      isNetworkUsable({ isConnected: null, isInternetReachable: null }),
    ).toBe(true);
  });
});
