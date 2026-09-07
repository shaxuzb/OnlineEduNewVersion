/// <reference types="jest" />

import { getChatNotificationContent } from "./chatNotificationUtils";

describe("chat notification content", () => {
  it("creates a concise notification with the chat thread metadata", () => {
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
      body: "Assalomu alaykum",
      data: { type: "chat-message", threadId: "42" },
    });
  });
});
