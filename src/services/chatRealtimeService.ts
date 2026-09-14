import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
} from "@microsoft/signalr";
import Constants from "expo-constants";

const apiUrl = String(Constants.expoConfig?.extra?.API_URL ?? "").replace(
  /\/$/,
  "",
);

export const notificationsHubUrl = `${apiUrl}/hubs/notifications`;

export const buildNotificationsHubUrl = (accessToken?: string) =>
  accessToken
    ? `${notificationsHubUrl}?access_token=${encodeURIComponent(accessToken)}`
    : notificationsHubUrl;

export const shouldSuspendNotificationsHub = (
  platform: string,
  appState: string,
) => platform === "ios" && appState !== "active";

export const shouldRefreshCurrentPlanOnResume = (
  nextAppState: string,
) => nextAppState === "active";

export const createChatRealtimeConnection = (
  accessTokenFactory: () => Promise<string>,
  accessToken?: string,
): HubConnection =>
  new HubConnectionBuilder()
    .withUrl(buildNotificationsHubUrl(accessToken), {
      accessTokenFactory,
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Information)
    .build();
