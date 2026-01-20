import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";

import Constants from "expo-constants";

import * as SecureStore from "expo-secure-store";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";
import { COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/src/types";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const PdfViewer = React.memo(
  ({ themeId, authToken }: { themeId: number; authToken: string | null }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme.theme), [theme.theme]);
    const navigation = useNavigation();
    const handleLoadComplete = useCallback((numberOfPages: number) => {
      console.log("PDF loaded with", numberOfPages, "pages");
    }, []);

    const handleError = useCallback((error: any) => {
      Toast.show({ type: "error", text1: "Pdf yuklanmagan" });
      navigation.goBack();
    }, []);

    if (!authToken) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorTitle}>Autentifikatsiya xatosi</Text>
        </View>
      );
    }

    return (
      <Pdf
        source={{
          uri: `${Constants.expoConfig?.extra?.API_URL}/api/themeabstract/${themeId}`,
          headers: { Authorization: `Bearer ${authToken}` },
          cache: false,
          method: "get",
        }}
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
    );
  }
);

export default function ThemeAbstractScreen({
  navigation,
}: {
  navigation: any;
}) {
  const { theme } = useTheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  const route = useRoute();
  const { themeId, mavzu } = route.params as any;

  const [authToken, setAuthToken] = useState<string | null>(null);
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const sessionData = await SecureStore.getItemAsync("session");
        if (sessionData) {
          const { token } = JSON.parse(sessionData);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      }
    };

    loadAuthToken();
  }, []);
  useEffect(() => {
    navigation.setOptions({
      title: mavzu.toString(),
      freezeOnBlur: true,
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        {/* {pdfBlob && authToken ? ( */}
        <PdfViewer themeId={themeId} authToken={authToken} />
        {/* ) : (
             <View style={styles.errorContainer}>
               <Ionicons name="document-outline" size={64} color={COLORS.gray} />
               <Text style={styles.errorTitle}>Test topilmadi</Text>
               <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
                 <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
               </TouchableOpacity>
             </View>
           )} */}
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
    pdf: {
      flex: 1,
      width: width,
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
      color: COLORS.text,
      marginTop: SPACING.base,
      textAlign: "center",
    },
  });
