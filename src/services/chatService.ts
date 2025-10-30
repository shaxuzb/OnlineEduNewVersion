import { ChatMessage } from "../types";
import { $axiosPrivate } from "./AxiosService";

export const chatService = {
  getChatMessages: async (userId: number): Promise<ChatMessage[] | null> => {
    const { data } = await $axiosPrivate.get<ChatMessage[]>(
      `/chat/${userId}/messages`
    );
    return data.reverse();
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
    reader: number,
    values: { upToMessageId: number }
  ) => {
    const { data } = await $axiosPrivate.post(`/chat/${userId}/read?reader=${reader}`, values);
    return data;
  },
};
