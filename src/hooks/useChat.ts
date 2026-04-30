import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chatService";
import { ChatMessage } from "../types";

export const chatKeys = {
  getMessages: "getAllMessages",
};

export const useChat = <TData = ChatMessage[] | null>(
  userId: number,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
    select?: (messages: ChatMessage[] | null) => TData;
  },
) => {
  return useQuery<ChatMessage[] | null, Error, TData>({
    queryKey: [chatKeys.getMessages, userId],
    queryFn: () => chatService.getChatMessages(userId),
    enabled: options?.enabled ?? !!userId,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    select: options?.select,
  });
};

export const useUnreadChatCount = (
  userId: number,
  options?: { refetchInterval?: number; enabled?: boolean },
) =>
  useChat(userId, {
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    select: (messages) =>
      (messages ?? []).reduce((count, msg) => {
        if (msg.senderType === 1 && !msg.isRead) {
          return count + 1;
        }
        return count;
      }, 0),
  });

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      userId: number;
      text: string;
      attachmentUrl: string;
    }) => chatService.sendMessage(values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [chatKeys.getMessages, variables.userId],
      });
    },
  });
};

export const useReadMessage = (userId: number, reader: number) => {
  const queryClient = useQueryClient();
  const queryKey = [chatKeys.getMessages, userId] as const;

  return useMutation({
    mutationFn: (values: { upToMessageId: number }) =>
      chatService.readMessage(userId, reader, values),
    onMutate: async (values: { upToMessageId: number }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousMessages = queryClient.getQueryData<any[]>(queryKey);
      if (!previousMessages) {
        return { previousMessages };
      }

      queryClient.setQueryData<any[]>(queryKey, (old = []) =>
        old.map((message) => {
          if (
            message.senderType === 1 &&
            !message.isRead &&
            message.id <= values.upToMessageId
          ) {
            return { ...message, isRead: true };
          }
          return message;
        }),
      );

      return { previousMessages };
    },
    onError: (_error, _values, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKey, context.previousMessages);
      }
    },
  });
};
