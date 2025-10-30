import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "../services/chatService";

export const chatKeys = {
  getMessages: "getAllMessages",
};

export const useChat = (userId: number) => {
  return useQuery({
    queryKey: [chatKeys.getMessages],
    queryFn: () => chatService.getChatMessages(userId),
    enabled: !!userId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: {
      userId: number;
      text: string;
      attachmentUrl: string;
    }) => chatService.sendMessage(values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chatKeys.getMessages],
      });
    },
  });
};

export const useReadMessage = (userId: number, reader: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: { upToMessageId: number }) =>
      chatService.readMessage(userId, reader, values),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chatKeys.getMessages],
      });
    },
  });
};
