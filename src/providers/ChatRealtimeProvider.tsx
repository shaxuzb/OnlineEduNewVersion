import React, { ReactNode, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppState } from "react-native";
import { useAuth } from "../context/AuthContext";
import { chatKeys } from "../hooks/useChat";
import { ChatMessage } from "../types";
import {
  ChatUnreadState,
  emptyChatUnreadState,
  mergeIncomingMessage,
  normalizeIncomingMessage,
  normalizeUnreadPayload,
} from "../services/chatRealtimeUtils";
import { chatService } from "../services/chatService";
import { createChatRealtimeConnection } from "../services/chatRealtimeService";
import { isChatScreenVisible } from "../services/chatPresenceService";
import {
  configureChatNotifications,
  showChatMessageNotification,
} from "../services/chatNotificationService";

interface ChatRealtimeProviderProps {
  children: ReactNode;
}

const SESSION_KEY = "session";

const getAccessToken = async (): Promise<string> => {
  const session = await SecureStore.getItemAsync(SESSION_KEY);
  if (!session) return "";

  try {
    const parsed = JSON.parse(session) as { token?: string };
    return parsed.token ?? "";
  } catch {
    return "";
  }
};

export const ChatRealtimeProvider: React.FC<ChatRealtimeProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  useQuery({
    queryKey: chatKeys.unread,
    queryFn: chatService.getUnread,
    enabled: Boolean(userId),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (!userId) return;

    void configureChatNotifications();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const connection = createChatRealtimeConnection(getAccessToken);

    const handleMessageReceived = (
      payload: unknown,
      messagePayload?: unknown,
    ) => {
      const event = normalizeIncomingMessage(payload, messagePayload);
      if (!event || String(event.threadId) !== String(userId)) return;

      const queryKey = chatKeys.messages(userId);
      const existing = queryClient.getQueryData<ChatMessage[] | null>(queryKey);
      if (Array.isArray(existing)) {
        queryClient.setQueryData<ChatMessage[]>(
          queryKey,
          mergeIncomingMessage(existing, event.message),
        );
      } else {
        queryClient.invalidateQueries({ queryKey, refetchType: "active" });
      }

      if (
        event.message.senderType === 1 &&
        (AppState.currentState !== "active" ||
          !isChatScreenVisible(event.threadId))
      ) {
        void showChatMessageNotification(event);
      }
    };

    const handleUnreadUpdated = (payload: unknown) => {
      const previous =
        queryClient.getQueryData<ChatUnreadState>(chatKeys.unread) ??
        emptyChatUnreadState;
      queryClient.setQueryData(
        chatKeys.unread,
        normalizeUnreadPayload(payload, previous),
      );
    };

    connection.on("chatMessageReceived", handleMessageReceived);
    connection.on("chatUnreadUpdated", handleUnreadUpdated);
    connection.onreconnected(() => {
      void queryClient.refetchQueries({
        queryKey: chatKeys.unread,
        type: "active",
      });
    });

    const startConnection = async () => {
      try {
        await connection.start();
      } catch {
        if (!disposed) {
          retryTimer = setTimeout(startConnection, 5000);
        }
      }
    };

    void startConnection();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      connection.off("chatMessageReceived", handleMessageReceived);
      connection.off("chatUnreadUpdated", handleUnreadUpdated);
      void connection.stop();
    };
  }, [queryClient, userId]);

  return <>{children}</>;
};
