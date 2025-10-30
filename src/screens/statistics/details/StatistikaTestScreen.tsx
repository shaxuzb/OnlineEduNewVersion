import React, { memo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useThemeTestStatistics } from "@/src/hooks/useStatistics";
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";

function StatistikaTestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Get route params
  const { testId, userId, subjectId, themeName, themePercent } =
    (route.params as any) || {};

  // API hooks
  const { data, isLoading, error, refetch } = useThemeTestStatistics(
    userId,
    subjectId,
    testId
  );
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refetch();
    });
    return () => task.cancel();
  }, []);
  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, []);

  const handleRetry = useCallback(() => {
    navigation.goBack();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{themeName}</Text>
          <Text style={styles.headerSubtitle}>Natija</Text>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        <View style={styles.content}>
          {/* Percentage Circle */}
          <View style={styles.percentageContainer}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{themePercent}%</Text>
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
              {data?.wrongOrUnsolvedNumbers.map((number, index) => (
                <View key={index} style={styles.wrongNumberBadge}>
                  <Text style={styles.wrongNumberText}>{number}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.encouragementText}>
              Ushbu misollari qayta hal qilishni tavsiya qilamiz!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>

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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.base,
      minHeight: 60,
    },
    headerButton: {
      padding: SPACING.xs,
      minWidth: 40,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: SPACING.base,
    },
    headerTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "bold",
      textAlign: "center",
      color: "white",
    },
    headerSubtitle: {
      fontSize: FONT_SIZES.sm,
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
      width: 150,
      height: 150,
      borderRadius: 75,
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
      fontSize: 48,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    statsContainer: {
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
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: SPACING.sm,
    },
    statsLabel: {
      fontSize: FONT_SIZES.lg,
      color: theme.colors.text,
      fontWeight: "500",
    },
    statsValue: {
      fontSize: FONT_SIZES.lg,
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
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
      fontWeight: "600",
      marginBottom: SPACING.base,
      lineHeight: 22,
    },
    wrongNumbersContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
      marginBottom: SPACING.base,
    },
    wrongNumberBadge: {
      backgroundColor: theme.colors.error + "20",
      borderColor: theme.colors.error,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.sm,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    wrongNumberText: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.error,
      fontWeight: "600",
    },
    encouragementText: {
      fontSize: FONT_SIZES.base,
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
      marginTop: "auto",
      marginBottom: SPACING.xl,
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.base,
      gap: SPACING.xs,
    },
    retryButton: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    retryButtonText: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.primary,
      fontWeight: "600",
    },
    finishButton: {
      backgroundColor: theme.colors.primary,
    },
    finishButtonText: {
      fontSize: FONT_SIZES.base,
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
