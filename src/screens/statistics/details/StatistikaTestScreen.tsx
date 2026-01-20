import { modalService } from "@/src/components/modals/modalService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeTestStatistics } from "@/src/hooks/useStatistics";
import { Theme, ThemeTestStatisticWrongAnswers } from "@/src/types";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

function StatistikaTestScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { plan } = useAuth();
  // Get route params
  const { testId, userId, subjectId, themeName, themeId } = route.params;

  // API hooks
  const { data, isLoading, error, refetch } = useThemeTestStatistics(
    Number(userId),
    Number(subjectId),
    Number(testId)
  );
  const groupedTestData = useMemo(() => {
    if (!data) return [];

    return Object.entries(
      data.wrongOrUnsolvedNumbers.reduce((acc: any, key: any) => {
        const group = acc[key.subTestNo] || [];
        group.push(key);
        acc[key.subTestNo] = group;
        return acc;
      }, {})
    );
  }, [data]);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refetch();
    });
    return () => task.cancel();
  }, []);
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);
  useEffect(() => {
    navigation.setOptions({
      title: themeName.toString(),
      headerTitle: ({ children }: { children: any }) => (
        <View
          style={{
            alignItems: "center",
            paddingBottom: moderateScale(3),
          }}
        >
          <Text style={styles.headerTitle}>{children}</Text>
          {/* <Text style={styles.headerSubtitle}>Natija</Text> */}
        </View>
      ),
      headerRight: () => <Text style={{ width: 55 }}></Text>,
      headerTintColor: "white",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Natijalar yuklanmoqda...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={theme.colors.error}
          />
          <Text style={styles.errorTitle}>Natijalar topilmadi</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Percentage Circle */}
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={styles.content}>
              <View style={styles.percentageContainer}>
                <View style={styles.percentageCircle}>
                  <Text style={styles.percentageText}>{data?.percent}%</Text>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>To'g'ri:</Text>
                  <Text style={styles.statsValue}>{data?.correct} ta</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Noto'g'ri:</Text>
                  <Text style={styles.statsValue}>{data?.wrong} ta</Text>
                </View>
              </View>

              {/* Wrong Answers Section */}
              <View style={styles.wrongAnswersSection}>
                <Text style={styles.wrongAnswersTitle}>
                  Xato ishlangan yoki ishlanmagan misol nomerlari:
                </Text>

                <View style={styles.wrongNumbersContainer}>
                  {groupedTestData.map(([subTestNo, questions]) => {
                    return (
                      <View key={subTestNo}>
                        <Text
                          style={{
                            fontSize: moderateScale(16),
                            marginBottom: 8,
                            color: theme.colors.text,
                          }}
                        >
                          Test {subTestNo}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 5,
                            flexWrap: "wrap",
                          }}
                        >
                          {(questions as ThemeTestStatisticWrongAnswers[]).map(
                            (num, index) => (
                              <View key={index} style={styles.wrongNumberBadge}>
                                <Text style={styles.wrongNumberText}>
                                  {num.questionNumber}
                                </Text>
                              </View>
                            )
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                <Text style={styles.encouragementText}>
                  Ushbu misollari qayta hal qilishni tavsiya qilamiz!
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={() => {
                if (
                  plan &&
                  plan.plan.subscriptionFeatures.find(
                    (item) => item.code === "SOLUTION"
                  )
                ) {
                  navigation.navigate("QuizSolution", {
                    userId,
                    testId,
                    themeId: themeId,
                    percent: data?.percent,
                  });
                } else {
                  modalService.open();
                }
              }}
            >
              {!(
                plan &&
                plan.plan.subscriptionFeatures.find(
                  (item) => item.code === "SOLUTION"
                )
              ) && (
                <View
                  style={{
                    position: "absolute",
                    top: moderateScale(-10),
                    right: moderateScale(-8),
                  }}
                >
                  <FontAwesome6
                    name="crown"
                    size={moderateScale(16)}
                    color="#FFD700"
                  />
                </View>
              )}
              <Ionicons
                name="eye-outline"
                size={moderateScale(18)}
                color={theme.colors.primary}
              />
              <Text style={styles.outlineText}>Natijani ko‘rish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.finishButton]}
              onPress={handleGoBack}
            >
              <Text style={styles.finishButtonText}>Ortga qaytish</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
export default memo(StatistikaTestScreen);
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      textAlign: "center",
      color: "white",
    },
    headerSubtitle: {
      fontSize: moderateScale(FONT_SIZES.xs),
      color: "white",
      opacity: 0.8,
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
      alignItems: "center",
    },
    percentageContainer: {
      marginBottom: SPACING.xl,
    },
    percentageCircle: {
      width: moderateScale(130),
      height: moderateScale(130),
      borderRadius: moderateScale(75),
      backgroundColor: theme.colors.card,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 4,
      borderColor: theme.colors.primary,
    },
    percentageText: {
      fontSize: moderateScale(42),
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    statsContainer: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      padding: moderateScale(SPACING.sm),
      marginBottom: moderateScale(SPACING.base),
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SPACING.sm,
    },
    statsLabel: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
      fontWeight: "500",
    },
    statsValue: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
      fontWeight: "bold",
    },
    wrongAnswersSection: {
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.base,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    wrongAnswersTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
      fontWeight: "600",
      marginBottom: SPACING.base,
      lineHeight: 22,
    },
    wrongNumbersContainer: {
      flexDirection: "column",
      gap: SPACING.xs,
      marginBottom: SPACING.base,
    },
    wrongNumberBadge: {
      backgroundColor: theme.colors.error + "20",
      borderColor: theme.colors.error,
      borderWidth: 1,
      borderRadius: moderateScale(BORDER_RADIUS.sm - 2),
      paddingHorizontal: moderateScale(SPACING.xs),
      paddingVertical: moderateScale(SPACING.xs - 2),
      marginBottom: moderateScale(SPACING.xs - 2),
    },
    wrongNumberText: {
      fontSize: moderateScale(FONT_SIZES.sm),
      color: theme.colors.error,
      fontWeight: "600",
    },
    encouragementText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
      fontWeight: "500",
      textAlign: "center",
      marginTop: SPACING.sm,
      fontStyle: "italic",
    },
    actionButtons: {
      flexDirection: "row",
      gap: SPACING.base,
      width: "100%",
      paddingHorizontal: moderateScale(SPACING.base),
      marginTop: "auto",
      paddingTop: moderateScale(SPACING.xs),
      marginBottom: moderateScale(SPACING.xs),
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: moderateScale(SPACING.sm),
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      gap: SPACING.xs,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: moderateScale(10),
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      gap: SPACING.xs,
    },
    outlineButton: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    outlineText: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontSize: moderateScale(FONT_SIZES.base),
    },
    retryButton: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    retryButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.primary,
      fontWeight: "600",
    },
    finishButton: {
      backgroundColor: theme.colors.primary,
    },
    finishButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: "white",
      fontWeight: "600",
    },
    // Loading and error states
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      marginTop: SPACING.base,
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
      backgroundColor: theme.colors.background,
    },
    errorTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: SPACING.base,
      textAlign: "center",
    },
  });
