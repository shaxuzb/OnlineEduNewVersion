import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import { Theme } from "@/src/types";
import { COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import PdfLoadingState from "@/src/components/courses/PdfLoadingState";
import { shouldShowPdfLoading } from "./pdfLoadingUtils";

const { width } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "ThemeAbstract">;

type ThemeAbstractPdfProps = {
  themeId: number;
  authToken: string | null;
  isAuthLoading: boolean;
  onError: (error: unknown) => void;
};

const ThemeAbstractPdf = React.memo(
  ({ themeId, authToken, isAuthLoading, onError }: ThemeAbstractPdfProps) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [isPdfLoading, setIsPdfLoading] = useState(true);

    useEffect(() => {
      setIsPdfLoading(true);
    }, [authToken, themeId]);

    if (isAuthLoading) {
      return (
        <PdfLoadingState
          color={theme.colors.primary}
          backgroundColor={theme.colors.background}
        />
      );
    }

    if (!authToken) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorTitle}>Autentifikatsiya xatosi</Text>
        </View>
      );
    }

    return (
      <View style={styles.pdfViewer}>
        <Pdf
          source={{
            uri: `${Constants.expoConfig?.extra?.API_URL}/api/themeabstract/${themeId}`,
            headers: { Authorization: `Bearer ${authToken}` },
            cache: false,
            method: "get",
          }}
          onLoadComplete={() => setIsPdfLoading(false)}
          onError={onError}
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
        {shouldShowPdfLoading(authToken, isPdfLoading) && (
          <PdfLoadingState
            color={theme.colors.primary}
            backgroundColor={theme.colors.background}
          />
        )}
      </View>
    );
  },
);

export default function ThemeAbstractScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { themeId, mavzu } = route.params;
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAuthToken = async () => {
      try {
        const sessionData = await SecureStore.getItemAsync("session");
        if (!active) return;

        if (!sessionData) {
          setAuthToken(null);
          return;
        }

        const session = JSON.parse(sessionData) as { token?: string };
        setAuthToken(session.token ?? null);
      } catch (error) {
        console.error("Error loading auth token:", error);
        if (active) setAuthToken(null);
      } finally {
        if (active) setIsAuthLoading(false);
      }
    };

    void loadAuthToken();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: mavzu.toString(),
      freezeOnBlur: true,
    });
  }, [mavzu, navigation]);

  const handlePdfError = useCallback(
    (error: unknown) => {
      console.warn("Theme abstract PDF error:", error);
      Toast.show({ type: "error", text1: "Pdf yuklanmagan" });
      navigation.goBack();
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.pdfContainer}>
        <ThemeAbstractPdf
          themeId={themeId}
          authToken={authToken}
          isAuthLoading={isAuthLoading}
          onError={handlePdfError}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    pdfContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    pdfViewer: {
      flex: 1,
      position: "relative",
    },
    pdf: {
      flex: 1,
      width,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
    },
    errorTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: SPACING.base,
      textAlign: "center",
    },
  });
