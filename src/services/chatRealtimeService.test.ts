/// <reference types="jest" />

import {
  buildNotificationsHubUrl,
  getChatReconnectDelay,
  notificationsHubUrl,
  shouldAttemptChatConnection,
  shouldRefreshCurrentPlanOnResume,
  shouldSuspendNotificationsHub,
} from "./chatRealtimeService";

describe("chat realtime connection policy", () => {
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

  it("uses bounded backoff for initial connection failures", () => {
    expect([0, 1, 2, 3, 4, 5, 20].map(getChatReconnectDelay)).toEqual([
      1000,
      2000,
      5000,
      10000,
      30000,
      30000,
      30000,
    ]);
  });

  it("does not attempt a connection while known offline", () => {
    expect(
      shouldAttemptChatConnection({
        online: false,
        platform: "android",
        appState: "active",
      }),
    ).toBe(false);
  });

  it("keeps the existing iOS background suspension rule", () => {
    expect(
      shouldAttemptChatConnection({
        online: true,
        platform: "ios",
        appState: "background",
      }),
    ).toBe(false);
    expect(
      shouldAttemptChatConnection({
        online: true,
        platform: "ios",
        appState: "active",
      }),
    ).toBe(true);
  });
});
