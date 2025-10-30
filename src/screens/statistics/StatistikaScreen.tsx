import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Theme, SubjectStatistic } from "../../types";
import { SPACING, FONT_SIZES, BORDER_RADIUS, COLORS } from "../../utils";
import { useStatistics } from "../../hooks/useStatistics";
import LoadingData from "@/src/components/exceptions/LoadingData";
import ErrorData from "@/src/components/exceptions/ErrorData";

function StatistikaScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute();
  const { userId } = route.params as any;
  const { data: statistics, isLoading, error, refetch } = useStatistics(userId);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!statistics || !Array.isArray(statistics) || statistics.length === 0)
      return 0;

    const totalPercent = statistics.reduce(
      (sum: number, stat: SubjectStatistic) => sum + stat.percent,
      0
    );
    return Math.round(totalPercent / statistics.length);
  }, [statistics]);
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refetch();
    });
    return () => task.cancel();
  }, []);

  const handleRoutePress = useCallback((item: SubjectStatistic) => {
    (navigation as any).navigate("StatistikaDetail", {
      userId: userId,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      subjectPercent: item.percent,
    });
  }, []);
  // Get color for subject based on percentage
  const getSubjectColor = useCallback((percentage: number) => {
    if (percentage >= 80) return theme.colors.success;
    if (percentage >= 60) return theme.colors.primary;
    if (percentage >= 40) return theme.colors.warning;
    return theme.colors.error;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistika</Text>
        <View style={styles.headerIndicator}>
          <View style={styles.dotIndicator} />
        </View>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingData />
      ) : error ? (
        <ErrorData refetch={refetch} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pie Chart Section */}
          <View style={styles.chartSection}>
            <View style={styles.chartCard}>
              <View style={styles.pieChartContainer}>
                {/* Beautiful 3D Pie Chart */}
                <View style={styles.pieChartWrapper}>
                  {/* Outer ring */}
                  <View
                    style={[
                      styles.outerRing,
                      { borderColor: theme.colors.primary + "30" },
                    ]}
                  />

                  {/* Main pie chart */}
                  <View style={styles.pieBase}>
                    {/* Completed segment */}
                    <View
                      style={[
                        styles.completedSegment,
                        {
                          backgroundColor: theme.colors.primary,
                          transform: [
                            { rotate: `${-90 + overallProgress * 3.6}deg` },
                          ],
                        },
                      ]}
                    />
                    {/* Remaining segment */}
                    <View
                      style={[
                        styles.remainingSegment,
                        {
                          backgroundColor: theme.colors.divider,
                          opacity: theme.isDark ? 0.3 : 0.2,
                        },
                      ]}
                    />
                  </View>

                  {/* Center circle with gradient effect */}
                  <View
                    style={[
                      styles.centerCircle,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    <View style={styles.centerContent}>
                      <Text
                        style={[
                          styles.centerPercentage,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {overallProgress}%
                      </Text>
                      <Text style={styles.centerLabel}>Jarayonda</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>Umumiy o'zlashtirish</Text>
                <Text style={styles.progressSubtitle}>
                  {statistics && Array.isArray(statistics)
                    ? statistics.length
                    : 0}{" "}
                  ta fanlar bo'yicha
                </Text>
              </View>
            </View>
          </View>

          {/* Course Statistics */}
          <View style={styles.courseStatsSection}>
            <Text style={styles.sectionTitle}>Fanlar bo'yicha natijalar</Text>

            {statistics &&
              Array.isArray(statistics) &&
              statistics.length > 0 ? (
              statistics.map((stat: SubjectStatistic, index: number) => (
                <TouchableOpacity
                  key={stat.subjectId}
                  style={[
                    styles.courseStatItem,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        theme.colors.border + (theme.isDark ? "30" : "50"),
                    },
                  ]}
                  onPress={() => handleRoutePress(stat)}
                  activeOpacity={0.7}
                >
                  {/* Subject Icon */}
                  <View
                    style={[
                      styles.subjectIcon,
                      { backgroundColor: getSubjectColor(stat.percent) + "20" },
                    ]}
                  >
                    <View
                      style={[
                        styles.subjectIconInner,
                        { backgroundColor: getSubjectColor(stat.percent) },
                      ]}
                    >
                      <Text style={styles.subjectIconText}>
                        {stat.subjectName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.courseStatContent}>
                    <View style={styles.courseStatHeader}>
                      <Text style={styles.courseStatName}>
                        {stat.subjectName}
                      </Text>
                      <View
                        style={[
                          styles.percentageBadge,
                          {
                            backgroundColor:
                              getSubjectColor(stat.percent) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.percentageText,
                            { color: getSubjectColor(stat.percent) },
                          ]}
                        >
                          {stat.percent}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.courseStatDetails}>
                      <Text style={styles.courseStatSubtext}>
                        {stat.correctSum}/{stat.totalSum} to'g'ri javob
                      </Text>

                      {/* Enhanced Progress Bar */}
                      <View
                        style={[
                          styles.progressBarContainer,
                          {
                            backgroundColor:
                              theme.colors.divider +
                              (theme.isDark ? "30" : "50"),
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${stat.percent}%`,
                              backgroundColor: getSubjectColor(stat.percent),
                            },
                          ]}
                        />
                        {/* Shine effect */}
                        <View
                          style={[
                            styles.progressBarShine,
                            { width: `${stat.percent}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.courseStatArrow}>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyStateIcon,
                    { backgroundColor: theme.colors.divider + "30" },
                  ]}
                >
                  <Ionicons
                    name="bar-chart-outline"
                    size={32}
                    color={theme.colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  Statistika mavjud emas
                </Text>
                <Text style={styles.emptyStateText}>
                  Hozircha statistika ma'lumotlari yo'q. Testlarni yechib
                  ko'ring.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
export default memo(StatistikaScreen);
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

    backButton: {
      padding: SPACING.xs,
      width: 40,
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: "white",
      flex: 1,
      textAlign: "center",
    },
    headerIndicator: {
      width: 40,
      alignItems: "flex-end",
      paddingRight: SPACING.xs,
    },
    dotIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "white",
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    chartSection: {
      paddingVertical: SPACING["2xl"],
      paddingHorizontal: SPACING.lg,
    },
    chartCard: {
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING["2xl"],
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: theme.colors.border + (theme.isDark ? "20" : "40"),
    },
    pieChartContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACING.lg,
    },
    pieChartWrapper: {
      width: 200,
      height: 200,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    outerRing: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 2,
    },
    pieBase: {
      width: 160,
      height: 160,
      borderRadius: 80,
      position: "relative",
      overflow: "hidden",
    },
    completedSegment: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 20,
      borderColor: "transparent",
      borderTopColor: theme.colors.primary,
      borderRightColor: theme.colors.primary,
    },
    remainingSegment: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 20,
      borderColor: "transparent",
    },
    centerCircle: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    centerContent: {
      alignItems: "center",
      justifyContent: "center",
    },
    centerPercentage: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 2,
    },
    centerLabel: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textMuted,
      fontWeight: "500",
    },
    pieShadow: {
      position: "absolute",
      bottom: -12,
      left: 20,
      right: 20,
      height: 20,
      borderRadius: 80,
    },
    progressInfo: {
      alignItems: "center",
    },
    progressTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },
    progressSubtitle: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    courseStatsSection: {
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING["2xl"],
    },
    sectionTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: SPACING.lg,
      paddingHorizontal: SPACING.xs,
    },
    skeletonContainer: {
      marginBottom: SPACING.base,
    },
    courseStatItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
      marginBottom: SPACING.base,
      borderRadius: BORDER_RADIUS.lg,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
    },
    subjectIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACING.base,
    },
    subjectIconInner: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    subjectIconText: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "bold",
      color: "white",
    },
    courseStatContent: {
      flex: 1,
      paddingRight: SPACING.base,
    },
    courseStatHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.xs,
    },
    courseStatName: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    percentageBadge: {
      paddingHorizontal: SPACING.base,
      paddingVertical: SPACING.xs / 2,
      borderRadius: BORDER_RADIUS.base,
      marginLeft: SPACING.base,
    },
    percentageText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "bold",
    },
    courseStatDetails: {
      gap: SPACING.xs,
    },
    courseStatSubtext: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textMuted,
    },
    progressBarContainer: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
      position: "relative",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
      position: "relative",
    },
    progressBarShine: {
      position: "absolute",
      top: 0,
      left: 0,
      height: "100%",
      borderRadius: 4,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    courseStatArrow: {
      padding: SPACING.xs,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: SPACING["3xl"],
      paddingHorizontal: SPACING.lg,
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACING.lg,
    },
    emptyStateTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },
    emptyStateText: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
  });
