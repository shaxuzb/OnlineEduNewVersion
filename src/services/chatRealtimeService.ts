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

const INITIAL_RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000] as const;

export const notificationsHubUrl = `${apiUrl}/hubs/notifications`;

// Authentication is intentionally owned by SignalR's accessTokenFactory so
// reconnects always use the latest session token instead of a token captured
// when the connection object was first created.
export const buildNotificationsHubUrl = (_accessToken?: string) =>
  notificationsHubUrl;

export const shouldSuspendNotificationsHub = (
  platform: string,
  appState: string,
) => platform === "ios" && appState !== "active";

export const shouldRefreshCurrentPlanOnResume = (
  nextAppState: string,
) => nextAppState === "active";

export const getChatReconnectDelay = (attempt: number): number => {
  const safeAttempt = Math.max(0, Math.floor(attempt));
  return INITIAL_RECONNECT_DELAYS[
    Math.min(safeAttempt, INITIAL_RECONNECT_DELAYS.length - 1)
  ];
};

export const shouldAttemptChatConnection = ({
  online,
  platform,
  appState,
}: {
  online: boolean;
  platform: string;
  appState: string;
}): boolean => online && !shouldSuspendNotificationsHub(platform, appState);

export const createChatRealtimeConnection = (
  accessTokenFactory: () => Promise<string>,
  _accessToken?: string,
): HubConnection =>
  new HubConnectionBuilder()
    .withUrl(buildNotificationsHubUrl(), {
      accessTokenFactory,
      transport: HttpTransportType.WebSockets,
      skipNegotiation: true,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Information)
    .build();
