import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { COLORS } from "../../utils";
import useProtectedPdfSource from "../../hooks/useProtectedPdfSource";
import PdfLoadingState from "./PdfLoadingState";

interface ProtectedPdfViewerProps {
  /**
   * API path of the document, with or without the `/api` prefix
   * (e.g. `themeabstract/12` or `/api/mock-tests/3/pdf`).
   */
  path: string;
  onLoadStateChange?: (loading: boolean) => void;
}

export default function ProtectedPdfViewer({
  path,
  onLoadStateChange,
}: ProtectedPdfViewerProps) {
  const { theme } = useTheme();
  const {
    source,
    status,
    errorMessage,
    reloadKey,
    handleLoadComplete,
    handleError,
    retry,
  } = useProtectedPdfSource(path);

  React.useEffect(() => {
    onLoadStateChange?.(status === "loading");
  }, [onLoadStateChange, status]);

  if (status === "error") {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons name="document-outline" size={64} color={COLORS.gray} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          PDF yuklanmadi
        </Text>
        {errorMessage ? (
          <Text style={[styles.errorDetail, { color: COLORS.gray }]}>
            {errorMessage}
          </Text>
        ) : null}
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={retry}
        >
          <Text style={styles.retryText}>Qayta urinish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!source) {
    return (
      <PdfLoadingState
        color={theme.colors.primary}
        backgroundColor={theme.colors.background}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        key={reloadKey}
        source={source}
        onLoadComplete={handleLoadComplete}
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
      {status === "loading" && (
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
  errorDetail: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
