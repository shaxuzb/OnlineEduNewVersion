import React, { ReactNode, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppState, Platform } from "react-native";
import { HubConnection, HubConnectionState } from "@microsoft/signalr";
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
import {
  createChatRealtimeConnection,
  getChatReconnectDelay,
  shouldAttemptChatConnection,
  shouldRefreshCurrentPlanOnResume,
  shouldSuspendNotificationsHub,
} from "../services/chatRealtimeService";
import { isChatScreenVisible } from "../services/chatPresenceService";
import {
  configureChatNotifications,
  showChatMessageNotification,
  showPaymentSuccessNotification,
} from "../services/chatNotificationService";
import { shouldShowChatNotification } from "../services/chatNotificationUtils";
import {
  getPaymentNotificationKey,
  isSuccessfulPaymentNotification,
  normalizePaymentNotification,
  paymentNotificationCountKey,
} from "../services/paymentNotificationUtils";
import { isNetworkUsable } from "../services/networkState";

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
  const { user, refetchPlan } = useAuth();
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
    let online = false;
    let retryAttempt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let connection: HubConnection | null = null;
    let startPromise: Promise<void> | null = null;
    let stopPromise: Promise<void> | null = null;
    const processedPaymentNotificationKeys = new Set<string>();

    const canAttemptConnection = (appState = AppState.currentState) =>
      shouldAttemptChatConnection({
        online,
        platform: Platform.OS,
        appState,
      });

    const clearRetryTimer = () => {
      if (!retryTimer) return;
      clearTimeout(retryTimer);
      retryTimer = undefined;
    };

    const refetchUnread = () =>
      queryClient.refetchQueries({
        queryKey: chatKeys.unread,
        type: "active",
      });

    const handleMessageReceived = (
      payload: unknown,
      messagePayload?: unknown,
    ) => {
      const event = normalizeIncomingMessage(payload, messagePayload);
      if (!event) {
        console.warn("[ChatRealtime] Unsupported chatMessageReceived payload");
        return;
      }

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
        shouldShowChatNotification(
          isChatScreenVisible(userId),
          AppState.currentState,
        )
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

    const handlePaymentNotification = (payload: unknown) => {
      console.info("[ChatRealtime] Notification event received", payload);
      if (!isSuccessfulPaymentNotification(payload)) return;

      const notification = normalizePaymentNotification(payload);
      if (!notification) return;

      const eventKey = getPaymentNotificationKey(notification);
      if (eventKey && processedPaymentNotificationKeys.has(eventKey)) return;
      if (eventKey) {
        processedPaymentNotificationKeys.add(eventKey);
        if (processedPaymentNotificationKeys.size > 50) {
          const oldestKey = processedPaymentNotificationKeys.values().next()
            .value;
          if (typeof oldestKey === "string") {
            processedPaymentNotificationKeys.delete(oldestKey);
          }
        }
      }

      const currentPaymentCount =
        queryClient.getQueryData<number>(paymentNotificationCountKey) ?? 0;
      queryClient.setQueryData(
        paymentNotificationCountKey,
        currentPaymentCount + 1,
      );
      refetchPlan();
      void showPaymentSuccessNotification(notification);
    };

    const bindConnection = (nextConnection: HubConnection) => {
      nextConnection.on("chatMessageReceived", handleMessageReceived);
      nextConnection.on("chatUnreadUpdated", handleUnreadUpdated);
      nextConnection.on("Notification", handlePaymentNotification);
      nextConnection.onreconnecting((error) => {
        console.warn("[ChatRealtime] Reconnecting", error?.message ?? "");
      });
      nextConnection.onreconnected((connectionId) => {
        retryAttempt = 0;
        console.info(
          "[ChatRealtime] Reconnected",
          connectionId ? `(${connectionId})` : "",
        );
        void refetchUnread();
      });
      nextConnection.onclose((error) => {
        if (disposed || !canAttemptConnection()) return;
        console.warn("[ChatRealtime] Connection closed", error?.message ?? "");
        void startConnection();
      });
    };

    const scheduleRetry = () => {
      if (disposed || !canAttemptConnection() || retryTimer) return;
      const delay = getChatReconnectDelay(retryAttempt);
      retryAttempt += 1;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        void startConnection();
      }, delay);
    };

    const startConnection = async () => {
      if (disposed || !canAttemptConnection() || startPromise) {
        return startPromise ?? undefined;
      }

      clearRetryTimer();
      startPromise = (async () => {
        try {
          const accessToken = await getAccessToken();
          if (!accessToken) throw new Error("Missing session token");
          if (stopPromise) await stopPromise;
          if (!canAttemptConnection()) return;

          if (!connection) {
            connection = createChatRealtimeConnection(
              getAccessToken,
              accessToken,
            );
            bindConnection(connection);
          }

          const nextConnection = connection;
          if (
            !nextConnection ||
            nextConnection.state !== HubConnectionState.Disconnected
          ) {
            return;
          }

          await nextConnection.start();

          if (disposed || !canAttemptConnection()) {
            await nextConnection.stop();
            return;
          }

          retryAttempt = 0;
          console.info("[ChatRealtime] Connected");
        } catch (error) {
          console.warn(
            "[ChatRealtime] Connection failed",
            error instanceof Error ? error.message : String(error),
          );
          scheduleRetry();
        } finally {
          startPromise = null;
        }
      })();

      return startPromise;
    };

    const stopConnection = async () => {
      clearRetryTimer();
      const nextConnection = connection;
      if (
        !nextConnection ||
        nextConnection.state === HubConnectionState.Disconnected
      ) {
        return;
      }

      try {
        await nextConnection.stop();
        console.info("[ChatRealtime] Connection paused");
      } catch (error) {
        console.warn(
          "[ChatRealtime] Failed to pause connection",
          error instanceof Error ? error.message : String(error),
        );
      }
    };

    const pauseConnection = () => {
      if (!stopPromise) {
        stopPromise = stopConnection().finally(() => {
          stopPromise = null;
        });
      }
      return stopPromise;
    };

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (shouldSuspendNotificationsHub(Platform.OS, nextAppState)) {
          void pauseConnection();
          return;
        }

        if (!shouldRefreshCurrentPlanOnResume(nextAppState)) return;

        if (canAttemptConnection(nextAppState)) {
          retryAttempt = 0;
          void startConnection();
          void refetchUnread();
        }
        refetchPlan();
        console.info("[ChatRealtime] Current plan refreshed after resume");
      },
    );

    const netInfoSubscription = NetInfo.addEventListener((state) => {
      const nextOnline = isNetworkUsable({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
      const recovered = !online && nextOnline;
      online = nextOnline;

      if (!online) {
        clearRetryTimer();
        void pauseConnection();
        return;
      }

      if (recovered) {
        retryAttempt = 0;
        void startConnection();
        void refetchUnread();
      }
    });

    void NetInfo.fetch().then((state) => {
      if (disposed) return;
      online = isNetworkUsable({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
      if (online) void startConnection();
    });

    return () => {
      disposed = true;
      appStateSubscription.remove();
      netInfoSubscription();
      clearRetryTimer();
      if (connection) {
        connection.off("chatMessageReceived", handleMessageReceived);
        connection.off("chatUnreadUpdated", handleUnreadUpdated);
        connection.off("Notification", handlePaymentNotification);
        void connection.stop();
      }
    };
  }, [queryClient, refetchPlan, userId]);

  return <>{children}</>;
};
