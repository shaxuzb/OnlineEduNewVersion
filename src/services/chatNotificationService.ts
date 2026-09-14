import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { IncomingChatMessage } from "./chatRealtimeUtils";
import { getChatNotificationContent } from "./chatNotificationUtils";
import { getPaymentNotificationContent } from "./paymentNotificationUtils";
import type { PaymentNotification } from "./paymentNotificationUtils";

export const CHAT_NOTIFICATION_CHANNEL_ID = "chat-messages";
export const PAYMENT_NOTIFICATION_CHANNEL_ID = "payment-notifications";

let configurationPromise: Promise<boolean> | null = null;

export const configureChatNotifications = async (): Promise<boolean> => {
  if (configurationPromise) return configurationPromise;

  configurationPromise = (async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        CHAT_NOTIFICATION_CHANNEL_ID,
        {
          name: "Chat xabarlari",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 150, 250],
          sound: "default",
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PRIVATE,
        },
      );
      await Notifications.setNotificationChannelAsync(
        PAYMENT_NOTIFICATION_CHANNEL_ID,
        {
          name: "To‘lovlar",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 150, 250],
          sound: "default",
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PRIVATE,
        },
      );
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    if (currentPermissions.granted) return true;

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    if (!requestedPermissions.granted) {
      console.warn(
        "[ChatNotification] Notification permission was not granted",
      );
    }
    return requestedPermissions.granted;
  })().catch((error) => {
    console.warn("Failed to configure chat notifications:", error);
    configurationPromise = null;
    return false;
  });

  return configurationPromise;
};

export const showChatMessageNotification = async (
  event: IncomingChatMessage,
): Promise<boolean> => {
  const isConfigured = await configureChatNotifications();
  if (!isConfigured) return false;

  const notification = getChatNotificationContent(event);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        ...notification,
        sound: "default",
        ...(Platform.OS === "android"
          ? { channelId: CHAT_NOTIFICATION_CHANNEL_ID }
          : {}),
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.warn("[ChatNotification] Failed to show notification:", error);
    return false;
  }
};

export const showPaymentSuccessNotification = async (
  notification: PaymentNotification,
): Promise<boolean> => {
  const isConfigured = await configureChatNotifications();
  if (!isConfigured) return false;

  const content = getPaymentNotificationContent(notification);
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        sound: "default",
        ...(Platform.OS === "android"
          ? { channelId: PAYMENT_NOTIFICATION_CHANNEL_ID }
          : {}),
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.warn(
      "[PaymentNotification] Failed to show notification:",
      error,
    );
    return false;
  }
};
