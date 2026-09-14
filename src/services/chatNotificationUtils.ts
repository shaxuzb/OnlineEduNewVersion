import { IncomingChatMessage } from "./chatRealtimeUtils";

export const shouldShowChatNotification = (
  chatScreenVisible: boolean,
  appState: string,
) => appState !== "active" || !chatScreenVisible;

export const getChatNotificationContent = ({
  threadId,
}: IncomingChatMessage) => ({
  title: "Sizda yangi xabar bor",
  body: "Yangi xabarni ko‘rish uchun ilovani oching",
  data: {
    type: "chat-message",
    threadId: String(threadId),
  },
});
