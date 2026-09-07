import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { IncomingChatMessage } from "./chatRealtimeUtils";
import { getChatNotificationContent } from "./chatNotificationUtils";

export const CHAT_NOTIFICATION_CHANNEL_ID = "chat-messages";

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
            Notifications.AndroidNotificationVisibility.PUBLIC,
        },
      );
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    if (currentPermissions.granted) return true;

    const requestedPermissions = await Notifications.requestPermissionsAsync();
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
};
