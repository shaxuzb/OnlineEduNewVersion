import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import * as ScreenCapture from "expo-screen-capture";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale, ScaledSheet } from "react-native-size-matters";
import ScreenGuardModule from "react-native-screenguard";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CustomStyledCard } from "@/src/components/ui/cards/CustomStyledCard";
import ProtectedPdfViewer from "@/src/components/courses/ProtectedPdfViewer";
import { modalService } from "@/src/components/modals/modalService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeTest } from "@/src/hooks/useQuiz";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import { Theme } from "@/src/types";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import {
  getQuizPdfPath,
  getQuizPdfToggleLabel,
  QuizPdfMode,
} from "./quizPdfModeUtils";

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

type Props = NativeStackScreenProps<RootStackParamList, "QuizScreen">;

export default function QuizScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { plan } = useAuth();
  const { testId, mavzu } = route.params;
  const numericTestId = Number(testId);
  const { data: testData, isLoading, error } = useThemeTest(numericTestId);
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
        <ProtectedPdfViewer path={pdfPath} />
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
