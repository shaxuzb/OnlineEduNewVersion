import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chatService";
import { ChatMessage } from "../types";
import { ChatUnreadState } from "../services/chatRealtimeUtils";
import { ChatReader } from "../services/chatService";

export const chatKeys = {
  messages: (userId: number) => ["chat", "messages", userId] as const,
  unread: ["chat", "unread"] as const,
  threads: ["chat", "threads"] as const,
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
    queryKey: chatKeys.messages(userId),
    queryFn: () => chatService.getChatMessages(userId),
    enabled: options?.enabled ?? !!userId,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 5000,
    select: options?.select,
  });
};

export const useChatUnread = (options?: { enabled?: boolean }) =>
  useQuery<ChatUnreadState, Error>({
    queryKey: chatKeys.unread,
    queryFn: chatService.getUnread,
    enabled: options?.enabled ?? true,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

export const useChatThreads = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.threads,
    queryFn: chatService.getThreads,
    enabled: options?.enabled ?? true,
    staleTime: 60 * 1000,
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
        queryKey: chatKeys.messages(variables.userId),
      });
    },
  });
};

export const useReadMessage = (
  userId: number,
  reader: ChatReader,
) => {
  const queryClient = useQueryClient();
  const queryKey = chatKeys.messages(userId);

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
