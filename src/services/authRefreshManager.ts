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

/** The session itself is unusable - retrying the refresh cannot help. */
export class AuthSessionRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthSessionRejectedError";
  }
}

/**
 * Only a definitive answer may end the session: a missing token, or the server
 * refusing the refresh token (any 4xx). A timeout, a dropped connection or a
 * 5xx says nothing about the session, and logging the user out for it turns
 * every network blip at the moment a token expires into a forced re-login.
 */
export const isAuthSessionRejected = (error: unknown): boolean => {
  if (error instanceof AuthSessionRejectedError) return true;
  if (typeof error !== "object" || error === null) return false;

  const response = (error as { response?: unknown }).response;
  if (typeof response !== "object" || response === null) return false;

  const status = (response as { status?: unknown }).status;
  if (typeof status !== "number") return false;
  if (status === 408 || status === 429) return false;
  return status >= 400 && status < 500;
};

export const createAuthRefreshManager = (deps: AuthRefreshDependencies) => {
  let inFlight: Promise<string> | null = null;

  const refreshOnce = async () => {
    const session = await deps.loadSession();
    if (!session?.refreshToken) {
      throw new AuthSessionRejectedError("No refresh token found");
    }

    const response = await deps.refreshRequest(
      session.refreshToken,
      await deps.getUniqueId(),
    );
    const accessToken = response.accessToken ?? response.token;
    if (!accessToken) {
      throw new AuthSessionRejectedError("No access token returned");
    }

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
            if (isAuthSessionRejected(error)) {
              await deps.clearSession();
              deps.onInvalidated();
            }
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
