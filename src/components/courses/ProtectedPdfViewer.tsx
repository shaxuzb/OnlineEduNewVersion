import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, StyleSheet, Text, View } from "react-native";
import Pdf from "react-native-pdf";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../utils";
import { getStoredAccessToken, refreshAccessToken } from "../../services/AxiosService";
import {
  buildProtectedMediaSource,
  isMediaAuthError,
} from "../../services/mediaAuthService";
import PdfLoadingState from "./PdfLoadingState";

interface ProtectedPdfViewerProps {
  path: string;
  onLoadStateChange?: (loading: boolean) => void;
}

export default function ProtectedPdfViewer({
  path,
  onLoadStateChange,
}: ProtectedPdfViewerProps) {
  const { theme } = useTheme();
  const [source, setSource] = useState<{
    uri: string;
    headers: Record<string, string>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const recoveryAttemptedRef = useRef(false);

  const setLoadingState = useCallback(
    (next: boolean) => {
      setLoading(next);
      onLoadStateChange?.(next);
    },
    [onLoadStateChange],
  );

  const loadSource = useCallback(
    async (forceRefresh = false) => {
      const token = forceRefresh
        ? await refreshAccessToken()
        : await getStoredAccessToken();
      if (!token) throw new Error("Missing media access token");
      setSource(buildProtectedMediaSource(path, token));
    },
    [path],
  );

  useEffect(() => {
    let active = true;
    recoveryAttemptedRef.current = false;
    setLoadingState(true);

    void loadSource().catch(() => {
      if (!active) return;
      setLoadingState(false);
      Alert.alert("Xatolik", "PDF faylni ochishda xatolik yuz berdi.");
    });

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active" || !active) return;
      void loadSource().catch(() => undefined);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, [loadSource, setLoadingState]);

  const handleError = useCallback(
    async (error: unknown) => {
      if (isMediaAuthError(error) && !recoveryAttemptedRef.current) {
        recoveryAttemptedRef.current = true;
        try {
          setLoadingState(true);
          await loadSource(true);
          return;
        } catch (refreshError) {
          console.warn("PDF auth recovery failed:", refreshError);
        }
      }

      setLoadingState(false);
      console.warn("Protected PDF error:", error);
      Alert.alert("Xatolik", "PDF faylni ochishda xatolik yuz berdi.");
    },
    [loadSource, setLoadingState],
  );

  if (!source) {
    return loading ? (
      <PdfLoadingState
        color={theme.colors.primary}
        backgroundColor={theme.colors.background}
      />
    ) : (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={64} color={COLORS.gray} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>PDF yuklanmadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        key={`${source.uri}:${source.headers.Authorization}`}
        source={{ ...source, cache: false, method: "get" }}
        onLoadComplete={() => setLoadingState(false)}
        onError={handleError}
        style={styles.pdf}
        trustAllCerts={false}
        enablePaging={false}
        horizontal={false}
        spacing={0}
        password=""
        scale={1}
        enableDoubleTapZoom
        minScale={1}
        maxScale={5}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      />
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <PdfLoadingState
            color={theme.colors.primary}
            backgroundColor={theme.colors.background}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pdf: { flex: 1, width: "100%" },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
});
