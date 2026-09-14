/// <reference types="jest" />

import {
  getChatNotificationContent,
  shouldShowChatNotification,
} from "./chatNotificationUtils";

describe("chat notification content", () => {
  it("keeps routing metadata without exposing message text", () => {
    expect(
      getChatNotificationContent({
        threadId: 42,
        message: {
          id: 10,
          text: "Assalomu alaykum",
          senderType: 1,
          createdAt: new Date("2026-01-01T00:02:00.000Z"),
          isRead: false,
          isSent: false,
        },
      }),
    ).toEqual({
      title: "Sizda yangi xabar bor",
      body: "Yangi xabarni ko‘rish uchun ilovani oching",
      data: { type: "chat-message", threadId: "42" },
    });
  });

  it("suppresses notifications while the chat screen is active", () => {
    expect(shouldShowChatNotification(true, "active")).toBe(false);
    expect(shouldShowChatNotification(false, "active")).toBe(true);
    expect(shouldShowChatNotification(true, "background")).toBe(true);
  });
});
