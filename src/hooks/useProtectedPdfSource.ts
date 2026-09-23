import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import {
  getStoredAccessToken,
  refreshAccessToken,
} from "../services/AxiosService";
import {
  buildProtectedMediaSource,
  isMediaAuthError,
} from "../services/mediaAuthService";

export type ProtectedPdfSource = {
  uri: string;
  headers: Record<string, string>;
};

const describePdfError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    try {
      return JSON.stringify(error);
    } catch {
      return "Noma'lum xatolik";
    }
  }
  return "Noma'lum xatolik";
};

export type ProtectedPdfStatus = "loading" | "ready" | "error";

export type ProtectedPdfSourceState = {
  source: ProtectedPdfSource | null;
  status: ProtectedPdfStatus;
  /** Native error text for the failed download, for diagnostics. */
  errorMessage: string | null;
  /** Bumped whenever the viewer must remount with a fresh token. */
  reloadKey: number;
  handleLoadComplete: () => void;
  handleError: (error: unknown) => void;
  retry: () => void;
};

/**
 * Resolves an authenticated source for `react-native-pdf`.
 *
 * `react-native-pdf` downloads the file natively, so it never passes through
 * the axios interceptors that refresh an expired access token. Reading the
 * token once at mount therefore breaks every PDF as soon as the stored token
 * expires. This hook keeps the token lifecycle attached to the viewer:
 * a 401/403 from the native download triggers exactly one refresh + remount.
 */
export const useProtectedPdfSource = (
  path: string | null | undefined,
): ProtectedPdfSourceState => {
  const [source, setSource] = useState<ProtectedPdfSource | null>(null);
  const [status, setStatus] = useState<ProtectedPdfStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recoveryAttemptedRef = useRef(false);
  const activeRef = useRef(true);
  const statusRef = useRef<ProtectedPdfStatus>("loading");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const resolveSource = useCallback(
    async (forceRefresh: boolean): Promise<ProtectedPdfSource> => {
      if (!path) throw new Error("Missing PDF path");

      const token = forceRefresh
        ? await refreshAccessToken()
        : await getStoredAccessToken();
      if (!token) throw new Error("Missing media access token");

      return buildProtectedMediaSource(path, token);
    },
    [path],
  );

  const applySource = useCallback(
    async (forceRefresh: boolean) => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        const nextSource = await resolveSource(forceRefresh);
        if (!activeRef.current) return;
        setSource(nextSource);
        setReloadKey((key) => key + 1);
      } catch (error) {
        if (!activeRef.current) return;
        console.warn("Protected PDF source failed:", error);
        setSource(null);
        setErrorMessage(describePdfError(error));
        setStatus("error");
      }
    },
    [resolveSource],
  );

  useEffect(() => {
    activeRef.current = true;
    recoveryAttemptedRef.current = false;
    void applySource(false);

    return () => {
      activeRef.current = false;
    };
  }, [applySource]);

  // Coming back from background with a token that expired meanwhile only
  // matters when the viewer is not already showing a rendered document.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") return;
      if (statusRef.current !== "error") return;

      recoveryAttemptedRef.current = false;
      void applySource(true);
    });

    return () => subscription.remove();
  }, [applySource]);

  const handleLoadComplete = useCallback(() => {
    recoveryAttemptedRef.current = false;
    setErrorMessage(null);
    setStatus("ready");
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (isMediaAuthError(error) && !recoveryAttemptedRef.current) {
        recoveryAttemptedRef.current = true;
        void applySource(true);
        return;
      }

      console.warn("Protected PDF error:", error);
      setErrorMessage(describePdfError(error));
      setStatus("error");
    },
    [applySource],
  );

  const retry = useCallback(() => {
    recoveryAttemptedRef.current = false;
    void applySource(true);
  }, [applySource]);

  return {
    source,
    status,
    errorMessage,
    reloadKey,
    handleLoadComplete,
    handleError,
    retry,
  };
};

export default useProtectedPdfSource;
