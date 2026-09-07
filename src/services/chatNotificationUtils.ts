import { IncomingChatMessage } from "./chatRealtimeUtils";

export const getChatNotificationContent = ({
  threadId,
  message,
}: IncomingChatMessage) => ({
  title: "Sizda yangi xabar bor",
  body: message.text.trim() || "Sizda yangi xabar bor",
  data: {
    type: "chat-message",
    threadId: String(threadId),
  },
});
