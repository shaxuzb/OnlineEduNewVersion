/// <reference types="jest" />

import {
  emptyChatUnreadState,
  mergeIncomingMessage,
  normalizeIncomingMessage,
  normalizeUnreadPayload,
} from "./chatRealtimeUtils";

describe("chat realtime payloads", () => {
  it("normalizes the unread response without recalculating counts", () => {
    const payload = {
      unreadThreadsCount: 2,
      totalUnreadMessages: 5,
      threads: [{ threadId: 42, unreadCount: 3, unreadForAdmin: 1 }],
    };

    expect(normalizeUnreadPayload(payload)).toEqual(payload);
  });

  it("merges a received message once by message id", () => {
    const existing = [
      {
        id: 1,
        text: "Old",
        senderType: 1 as const,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        isRead: true,
        isSent: false,
      },
    ];
    const incoming = {
      id: 2,
      text: "New",
      senderType: 1 as const,
      createdAt: new Date("2026-01-01T00:01:00.000Z"),
      isRead: false,
      isSent: false,
    };

    expect(mergeIncomingMessage(existing, incoming)).toEqual([
      incoming,
      existing[0],
    ]);
    expect(mergeIncomingMessage(existing, incoming)).toHaveLength(2);
    expect(normalizeUnreadPayload(undefined)).toEqual(emptyChatUnreadState);
  });

  it("normalizes a SignalR message event with its thread id", () => {
    expect(
      normalizeIncomingMessage({
        threadId: 42,
        message: {
          id: 9,
          text: "Hello",
          senderType: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          isRead: false,
        },
      }),
    ).toEqual({
      threadId: 42,
      message: {
        id: 9,
        text: "Hello",
        senderType: 1,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        isRead: false,
        isSent: false,
      },
    });
  });

  it("normalizes a SignalR callback that sends thread id and message separately", () => {
    expect(
      normalizeIncomingMessage(42, {
        id: 10,
        text: "Realtime",
        senderType: 1,
        createdAt: "2026-01-01T00:02:00.000Z",
        isRead: false,
      }),
    ).toEqual({
      threadId: 42,
      message: {
        id: 10,
        text: "Realtime",
        senderType: 1,
        createdAt: new Date("2026-01-01T00:02:00.000Z"),
        isRead: false,
        isSent: false,
      },
    });
  });
});
