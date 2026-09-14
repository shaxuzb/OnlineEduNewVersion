/// <reference types="jest" />

import {
  buildNotificationsHubUrl,
  notificationsHubUrl,
  shouldRefreshCurrentPlanOnResume,
  shouldSuspendNotificationsHub,
} from "./chatRealtimeService";

describe("chat realtime connection url", () => {
  it("adds the encoded access token to the SignalR websocket url", () => {
    expect(buildNotificationsHubUrl("token+with/slash")).toBe(
      `${notificationsHubUrl}?access_token=token%2Bwith%2Fslash`,
    );
  });

  it("suspends the hub on iOS outside the active app state", () => {
    expect(shouldSuspendNotificationsHub("ios", "active")).toBe(false);
    expect(shouldSuspendNotificationsHub("ios", "inactive")).toBe(true);
    expect(shouldSuspendNotificationsHub("ios", "background")).toBe(true);
    expect(shouldSuspendNotificationsHub("android", "background")).toBe(
      false,
    );
  });

  it("refreshes the current plan when the app becomes active", () => {
    expect(shouldRefreshCurrentPlanOnResume("active")).toBe(true);
    expect(shouldRefreshCurrentPlanOnResume("inactive")).toBe(false);
    expect(shouldRefreshCurrentPlanOnResume("background")).toBe(false);
  });
});
