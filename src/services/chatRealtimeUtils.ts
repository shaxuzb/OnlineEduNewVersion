import { ChatMessage } from "../types";

export interface ChatUnreadThread {
  threadId: number | string;
  unreadCount: number;
  unreadForAdmin?: number | boolean;
}

export interface ChatUnreadState {
  unreadThreadsCount: number;
  totalUnreadMessages: number;
  threads: ChatUnreadThread[];
}

export const emptyChatUnreadState: ChatUnreadState = {
  unreadThreadsCount: 0,
  totalUnreadMessages: 0,
  threads: [],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const toMessageId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSenderType = (value: unknown): 0 | 1 | null => {
  if (value === 0 || value === "0" || value === "User" || value === "user") {
    return 0;
  }
  if (
    value === 1 ||
    value === "1" ||
    value === "Admin" ||
    value === "admin"
  ) {
    return 1;
  }
  return null;
};

export const normalizeUnreadPayload = (
  payload: unknown,
  fallback: ChatUnreadState = emptyChatUnreadState,
): ChatUnreadState => {
  const root = isRecord(payload) ? payload : null;
  const value = root && isRecord(root.data) ? root.data : root;

  if (!value) return fallback;

  const threads = Array.isArray(value.threads)
    ? value.threads.filter(isRecord).map((thread) => ({
        threadId: (thread.threadId ?? thread.id ?? "") as number | string,
        unreadCount: toNumber(thread.unreadCount, 0),
        ...(thread.unreadForAdmin !== undefined
          ? { unreadForAdmin: thread.unreadForAdmin as number | boolean }
          : {}),
      }))
    : fallback.threads;

  return {
    unreadThreadsCount: toNumber(
      value.unreadThreadsCount,
      fallback.unreadThreadsCount,
    ),
    totalUnreadMessages: toNumber(
      value.totalUnreadMessages,
      fallback.totalUnreadMessages,
    ),
    threads,
  };
};

export const mergeIncomingMessage = (
  existing: ChatMessage[] | null | undefined,
  incoming: ChatMessage,
): ChatMessage[] => [
  incoming,
  ...(existing ?? []).filter((message) => message.id !== incoming.id),
];

export interface IncomingChatMessage {
  threadId: number | string;
  message: ChatMessage;
}

export const normalizeIncomingMessage = (
  payload: unknown,
  messagePayload?: unknown,
): IncomingChatMessage | null => {
  const eventPayload =
    messagePayload === undefined
      ? payload
      : { threadId: payload, message: messagePayload };
  if (!isRecord(eventPayload)) return null;

  const rawMessage = isRecord(eventPayload.message)
    ? eventPayload.message
    : isRecord(eventPayload.chatMessage)
      ? eventPayload.chatMessage
      : isRecord(eventPayload.data)
        ? eventPayload.data
    : eventPayload;
  const threadId =
    eventPayload.threadId ??
    eventPayload.threadID ??
    rawMessage.threadId ??
    rawMessage.threadID ??
    rawMessage.userId ??
    rawMessage.userID;
  const id = toMessageId(
    rawMessage.id ?? rawMessage.messageId ?? rawMessage.messageID,
  );
  const text = rawMessage.text ?? rawMessage.content ?? rawMessage.messageText;
  const senderType = toSenderType(rawMessage.senderType);
  const createdAt =
    rawMessage.createdAt ??
    rawMessage.sentAt ??
    rawMessage.timestamp ??
    rawMessage.createdDate;

  if (
    (typeof threadId !== "number" && typeof threadId !== "string") ||
    id === null ||
    typeof text !== "string" ||
    senderType === null ||
    (typeof createdAt !== "string" && !(createdAt instanceof Date))
  ) {
    return null;
  }

  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return {
    threadId,
    message: {
      id,
      text,
      senderType,
      createdAt: date,
      isRead: rawMessage.isRead === true || rawMessage.isRead === "true",
      isSent:
        typeof rawMessage.isSent === "boolean"
          ? rawMessage.isSent
          : senderType === 0,
    },
  };
};
