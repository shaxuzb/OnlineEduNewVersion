import { AuthToken } from "../types";

type RefreshResponse = {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
};

export interface AuthRefreshDependencies {
  loadSession: () => Promise<AuthToken | null>;
  saveSession: (session: AuthToken) => Promise<void>;
  clearSession: () => Promise<void>;
  getUniqueId: () => Promise<string>;
  refreshRequest: (
    refreshToken: string,
    uniqueId: string,
  ) => Promise<RefreshResponse>;
  onInvalidated: () => void;
}

export const createAuthRefreshManager = (deps: AuthRefreshDependencies) => {
  let inFlight: Promise<string> | null = null;

  const refreshOnce = async () => {
    const session = await deps.loadSession();
    if (!session?.refreshToken) throw new Error("No refresh token found");

    const response = await deps.refreshRequest(
      session.refreshToken,
      await deps.getUniqueId(),
    );
    const accessToken = response.accessToken ?? response.token;
    if (!accessToken) throw new Error("No access token returned");

    await deps.saveSession({
      ...session,
      token: accessToken,
      refreshToken: response.refreshToken ?? session.refreshToken,
    });

    return accessToken;
  };

  return {
    getAccessToken() {
      if (!inFlight) {
        inFlight = refreshOnce()
          .catch(async (error) => {
            await deps.clearSession();
            deps.onInvalidated();
            throw error;
          })
          .finally(() => {
            inFlight = null;
          });
      }

      return inFlight;
    },
  };
};
