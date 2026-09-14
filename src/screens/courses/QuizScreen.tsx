import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ScreenCapture from "expo-screen-capture";
import * as SecureStore from "expo-secure-store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, ScaledSheet } from "react-native-size-matters";
import ScreenGuardModule from "react-native-screenguard";
import { useFocusEffect } from "@react-navigation/native";
import { CustomStyledCard } from "@/src/components/ui/cards/CustomStyledCard";
import PdfLoadingState from "@/src/components/courses/PdfLoadingState";
import { modalService } from "@/src/components/modals/modalService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeTest } from "@/src/hooks/useQuiz";
import { Theme } from "@/src/types";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import {
  getQuizPdfPath,
  getQuizPdfToggleLabel,
  QuizPdfMode,
} from "./quizPdfModeUtils";
import { shouldShowPdfLoading } from "./pdfLoadingUtils";

const { width } = Dimensions.get("window");

const HeaderTitle = React.memo(({ title }: { title: string }) => (
  <View style={headerTitleStyles.container}>
    <Text
      style={headerTitleStyles.title}
      adjustsFontSizeToFit
      numberOfLines={2}
    >
      {title}
    </Text>
  </View>
));

const LoadingState = React.memo(() => (
  <SafeAreaView style={loadingStyles.container}>
    <View style={loadingStyles.content}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={loadingStyles.text}>Test yuklanmoqda...</Text>
    </View>
  </SafeAreaView>
));

const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <SafeAreaView style={errorStyles.container}>
    <View style={errorStyles.content}>
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
      <Text style={errorStyles.title}>Test ma'lumotlari yuklanmadi</Text>
      <TouchableOpacity style={errorStyles.button} onPress={onRetry}>
        <Text style={errorStyles.buttonText}>Orqaga qaytish</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
));

const PdfViewer = React.memo(
  ({
    pdfPath,
    authToken,
    isAuthLoading,
  }: {
    pdfPath: string;
    authToken: string | null;
    isAuthLoading: boolean;
  }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [isPdfLoading, setIsPdfLoading] = useState(true);

    useEffect(() => {
      setIsPdfLoading(true);
    }, [authToken, pdfPath]);

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
            uri: `${Constants.expoConfig?.extra?.API_URL}${pdfPath}`,
            headers: { Authorization: `Bearer ${authToken}` },
            cache: false,
            method: "get",
          }}
          onLoadComplete={() => setIsPdfLoading(false)}
          onError={(error) => {
            setIsPdfLoading(false);
            console.error("Quiz PDF error:", error);
            Alert.alert("Xatolik", "PDF faylni ochishda xatolik yuz berdi.");
          }}
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

export default function QuizScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { plan } = useAuth();
  const { testId, mavzu } = route.params;
  const numericTestId = Number(testId);
  const { data: testData, isLoading, error } = useThemeTest(numericTestId);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [pdfMode, setPdfMode] = useState<QuizPdfMode>("questions");
  const screenGuardEnabledRef = useRef(false);
  const guardRequestIdRef = useRef(0);

  const hasSolutionAccess = Boolean(
    plan?.plan.subscriptionFeatures.some((item) => item.code === "SOLUTION"),
  );
  const pdfPath = useMemo(
    () => getQuizPdfPath(numericTestId, pdfMode),
    [numericTestId, pdfMode],
  );
  const toggleLabel = getQuizPdfToggleLabel(pdfMode);

  useEffect(() => {
    void SecureStore.getItemAsync("session")
      .then((sessionData) => {
        if (sessionData) setAuthToken(JSON.parse(sessionData).token ?? null);
      })
      .catch((loadError) => console.error("Quiz token error:", loadError))
      .finally(() => setIsAuthLoading(false));
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePdfToggle = useCallback(() => {
    if (pdfMode === "answers") {
      setPdfMode("questions");
      return;
    }

    if (!hasSolutionAccess) {
      modalService.open();
      return;
    }

    setPdfMode("answers");
  }, [hasSolutionAccess, pdfMode]);

  const setScreenProtectionEnabled = useCallback((enabled: boolean) => {
    if (Platform.OS === "ios") {
      if (screenGuardEnabledRef.current === enabled) return;

      screenGuardEnabledRef.current = enabled;
      const requestId = ++guardRequestIdRef.current;

      InteractionManager.runAfterInteractions(() => {
        if (
          guardRequestIdRef.current !== requestId ||
          (enabled && !screenGuardEnabledRef.current)
        ) {
          return;
        }

        void (async () => {
          try {
            if (enabled) {
              try {
                await ScreenGuardModule.unregister();
              } catch {}

              await ScreenGuardModule.initSettings({
                displayScreenGuardOverlay: false,
                timeAfterResume: 500,
                getScreenshotPath: false,
              });

              if (
                guardRequestIdRef.current !== requestId ||
                !screenGuardEnabledRef.current
              ) {
                return;
              }

              await ScreenGuardModule.registerWithBlurView({ radius: 20 });
              return;
            }

            await ScreenGuardModule.unregister();
          } catch (screenGuardError) {
            console.warn("Quiz screen guard error:", screenGuardError);
          }
        })();
      });
      return;
    }

    if (Platform.OS === "android") {
      if (enabled) {
        void ScreenCapture.preventScreenCaptureAsync().catch(console.warn);
      } else {
        void ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
      }
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      title: mavzu || "Mashqlar (IDS kitobidan)",
      headerTitle: ({ children }: { children: string }) => (
        <HeaderTitle title={children} />
      ),
      headerBackTitle: ".",
      freezeOnBlur: true,
    });
  }, [mavzu, navigation]);

  useFocusEffect(
    useCallback(() => {
      setScreenProtectionEnabled(true);
      return () => setScreenProtectionEnabled(false);
    }, [setScreenProtectionEnabled]),
  );

  if (isLoading) return <LoadingState />;
  if (error || !testData) return <ErrorState onRetry={handleGoBack} />;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.pdfContainer}>
        <PdfViewer
          pdfPath={pdfPath}
          authToken={authToken}
          isAuthLoading={isAuthLoading}
        />
      </View>
      <View style={styles.quizControls}>
        <View style={styles.pdfToggleWrapper}>
          <CustomStyledCard style={styles.pdfToggleCard}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.pdfToggleButton}
              onPress={handlePdfToggle}
            >
              <Ionicons
                name={pdfMode === "answers" ? "book-outline" : "bulb-outline"}
                size={moderateScale(20)}
                color="#fff"
              />
              <Text style={styles.pdfToggleText}>{toggleLabel}</Text>
            </TouchableOpacity>
          </CustomStyledCard>
          {pdfMode === "questions" && !hasSolutionAccess && (
            <View pointerEvents="none" style={styles.crownBadge}>
              <FontAwesome6
                name="crown"
                size={moderateScale(18)}
                color="#FFD700"
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const headerTitleStyles = ScaledSheet.create({
  container: {
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.lg),
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: moderateScale(20),
    color: COLORS.white,
  },
});

const loadingStyles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  text: {
    marginTop: SPACING.base,
    fontSize: moderateScale(FONT_SIZES.base),
    color: COLORS.text,
  },
});

const errorStyles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: COLORS.secondary },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(SPACING.xl),
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.xl),
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.base,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    marginTop: SPACING.xl,
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: "500",
  },
});

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    pdfContainer: { flex: 1, backgroundColor: theme.colors.background },
    pdfViewer: { flex: 1, position: "relative" },
    pdf: { flex: 1, width },
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
    quizControls: {
      backgroundColor: theme.colors.card,
      paddingTop: SPACING.base,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
    },
    pdfToggleWrapper: {
      position: "relative",
      paddingTop: moderateScale(7),
      paddingRight: moderateScale(7),
      overflow: "visible",
    },
    pdfToggleCard: { borderRadius: moderateScale(BORDER_RADIUS.sm) },
    pdfToggleButton: {
      minHeight: moderateScale(46),
      paddingHorizontal: moderateScale(SPACING.base),
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: moderateScale(SPACING.xs),
    },
    pdfToggleText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: COLORS.white,
      fontWeight: "bold",
    },
    crownBadge: {
      position: "absolute",
      top: -4,
      right: 0,
      zIndex: 2,
      elevation: 2,
    },
  });
