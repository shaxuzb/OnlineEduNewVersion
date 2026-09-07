import { ChatMessage } from "../types";
import { $axiosPrivate } from "./AxiosService";
import {
  ChatUnreadState,
  normalizeUnreadPayload,
} from "./chatRealtimeUtils";

export type ChatReader = "Admin" | "User";

export interface ChatThread {
  id: number | string;
  userId?: number;
  unreadForAdmin: number;
  [key: string]: unknown;
}

export const chatService = {
  getUnread: async (): Promise<ChatUnreadState> => {
    const { data } = await $axiosPrivate.get("/chat/unread");
    return normalizeUnreadPayload(data);
  },

  getThreads: async (): Promise<ChatThread[]> => {
    const { data } = await $axiosPrivate.get<ChatThread[] | { threads: ChatThread[] }>(
      "/chat/threads",
    );
    return Array.isArray(data) ? data : data.threads;
  },

  getChatMessages: async (userId: number): Promise<ChatMessage[] | null> => {
    const { data } = await $axiosPrivate.get<ChatMessage[]>(
      `/chat/${userId}/messages`,
      {
        params: {
          take: 500,
        },
      },
    );
    return [...data].reverse();
  },
  sendMessage: async (values: {
    userId: number;
    text: string;
    attachmentUrl: string;
  }) => {
    const { data } = await $axiosPrivate.post("/chat/send/user", values);
    return data;
  },
  readMessage: async (
    userId: number,
    reader: ChatReader,
    values: { upToMessageId: number },
  ) => {
    const { data } = await $axiosPrivate.post(
      `/chat/${userId}/read?reader=${reader}`,
      values,
    );
    return data;
  },
};
