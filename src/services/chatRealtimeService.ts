import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import Constants from "expo-constants";

const apiUrl = String(Constants.expoConfig?.extra?.API_URL ?? "").replace(
  /\/$/,
  "",
);

export const notificationsHubUrl = `${apiUrl}/hubs/notifications`;

export const createChatRealtimeConnection = (
  accessTokenFactory: () => Promise<string>,
): HubConnection =>
  new HubConnectionBuilder()
    .withUrl(notificationsHubUrl, {
      accessTokenFactory,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Error)
    .build();
