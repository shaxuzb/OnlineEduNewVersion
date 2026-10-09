import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import * as FileSystem from "expo-file-system";
import {
  getStoredAccessToken,
  refreshAccessToken,
} from "../services/AxiosService";
import { buildProtectedMediaSource } from "../services/mediaAuthService";

/** A document that is already on disk, ready for `react-native-pdf`. */
export type ProtectedPdfSource = {
  uri: string;
};

export type ProtectedPdfStatus = "loading" | "ready" | "error";

export type ProtectedPdfSourceState = {
  source: ProtectedPdfSource | null;
  status: ProtectedPdfStatus;
  /** Reason of the last failure, for diagnostics. */
  errorMessage: string | null;
  /** Bumped whenever the viewer must remount with a new file. */
  reloadKey: number;
  handleLoadComplete: () => void;
  handleError: (error: unknown) => void;
  retry: () => void;
};

const UNKNOWN_ERROR = "Noma'lum xatolik";

const describePdfError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
    try {
      return JSON.stringify(error);
    } catch {
      return UNKNOWN_ERROR;
    }
  }
  return UNKNOWN_ERROR;
};

const isAuthStatus = (status: number) => status === 401 || status === 403;

const isSuccessStatus = (status: number) => status >= 200 && status < 300;

let downloadSequence = 0;

const createCacheFileUri = () => {
  if (!FileSystem.cacheDirectory) {
    throw new Error("Cache directory is unavailable");
  }

  downloadSequence += 1;
  return `${FileSystem.cacheDirectory}protected-pdf-${Date.now()}-${downloadSequence}.pdf`;
};

const discardFile = (uri: string | null) => {
  if (!uri) return;
  void FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined);
};

const downloadWithToken = async (path: string, token: string) => {
  const { uri, headers } = buildProtectedMediaSource(path, token);
  const fileUri = createCacheFileUri();

  try {
    const result = await FileSystem.downloadAsync(uri, fileUri, { headers });
    return { status: result.status, fileUri };
  } catch (error) {
    discardFile(fileUri);
    throw error;
  }
};

/**
 * Downloads a protected document to the cache and hands the viewer a local
 * file.
 *
 * `react-native-pdf` can download on its own, but it never looks at the HTTP
 * status: an expired token comes back as a generic "DownloadFailed" with no
 * code, so there is nothing to recover from. Owning the request here makes the
 * status visible - a 401/403 triggers exactly one token refresh and retry, and
 * any other failure is reported with its real status.
 */
export const useProtectedPdfSource = (
  path: string | null | undefined,
): ProtectedPdfSourceState => {
  const [source, setSource] = useState<ProtectedPdfSource | null>(null);
  const [status, setStatus] = useState<ProtectedPdfStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const fileUriRef = useRef<string | null>(null);
  const statusRef = useRef<ProtectedPdfStatus>("loading");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => requestIdRef.current === requestId;

    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!path) throw new Error("Missing PDF path");

      const storedToken = await getStoredAccessToken();
      if (!storedToken) throw new Error("Missing media access token");

      let download = await downloadWithToken(path, storedToken);

      if (isAuthStatus(download.status)) {
        discardFile(download.fileUri);
        download = await downloadWithToken(path, await refreshAccessToken());
      }

      if (!isSuccessStatus(download.status)) {
        discardFile(download.fileUri);
        throw new Error(`HTTP ${download.status}`);
      }

      if (!isCurrent()) {
        discardFile(download.fileUri);
        return;
      }

      discardFile(fileUriRef.current);
      fileUriRef.current = download.fileUri;
      setSource({ uri: download.fileUri });
      setReloadKey((key) => key + 1);
    } catch (error) {
      if (!isCurrent()) return;
      console.warn("Protected PDF download failed:", error);
      setSource(null);
      setErrorMessage(describePdfError(error));
      setStatus("error");
    }
  }, [path]);

  useEffect(() => {
    void load();

    return () => {
      // Invalidates the in-flight request and removes the protected file.
      requestIdRef.current += 1;
      discardFile(fileUriRef.current);
      fileUriRef.current = null;
    };
  }, [load]);

  // A failure caused by being offline or by a token that expired in the
  // background is worth one more attempt when the app returns.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") return;
      if (statusRef.current !== "error") return;
      void load();
    });

    return () => subscription.remove();
  }, [load]);

  const handleLoadComplete = useCallback(() => {
    setErrorMessage(null);
    setStatus("ready");
  }, []);

  const handleError = useCallback((error: unknown) => {
    console.warn("Protected PDF render failed:", error);
    setErrorMessage(describePdfError(error));
    setStatus("error");
  }, []);

  const retry = useCallback(() => {
    void load();
  }, [load]);

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
