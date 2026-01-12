import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useCurrentUserId } from "@/src/hooks/useQuiz";
import { useStatistics } from "@/src/hooks/useStatistics";
import { SubjectStatistic, Theme } from "@/src/types";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import {
  InteractionManager,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

function StatistikaScreen({ navigation }: { navigation: any }) {
  const userId = useCurrentUserId();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const {
    data: statistics,
    isLoading,
    error,
    refetch,
  } = useStatistics(Number(userId));

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
    navigation.navigate("StatistikaDetail", {
      userId: userId,
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      subjectPercent: item.percent,
    });
  }, []);
  const getSubjectColor = useCallback((percentage: number) => {
    if (percentage >= 80) return theme.colors.success;
    if (percentage >= 60) return theme.colors.primary;
    if (percentage >= 40) return theme.colors.warning;
    return theme.colors.error;
  }, []);
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar barStyle={"dark-content"} />
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
                  <LinearGradient
                    colors={["#3a5ede1f", "#5e85e61f"]}
                    start={{ x: 0.5, y: 1.0 }}
                    end={{ x: 0.5, y: 0.0 }}
                    style={styles.subjectIcon}
                  >
                    <LinearGradient
                      colors={["#3a5dde", "#5e84e6"]}
                      start={{ x: 0.5, y: 1.0 }}
                      end={{ x: 0.5, y: 0.0 }}
                      style={[styles.subjectIconInner]}
                    >
                      <Text style={styles.subjectIconText}>
                        {stat.subjectName.charAt(0).toUpperCase()}
                      </Text>
                    </LinearGradient>
                  </LinearGradient>

                  <View style={styles.courseStatContent}>
                    <View style={styles.courseStatHeader}>
                      <Text style={styles.courseStatName}>
                        {stat.subjectName}
                      </Text>
                      <LinearGradient
                        colors={["#3a5ede16", "#5e85e615"]}
                        start={{ x: 0.5, y: 1.0 }}
                        end={{ x: 0.5, y: 0.0 }}
                        style={[
                          styles.percentageBadge,
                          {
                            backgroundColor:
                              getSubjectColor(stat.percent) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[styles.percentageText, { color: "#3a5dde" }]}
                        >
                          {stat.percent}%
                        </Text>
                      </LinearGradient>
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
                      size={moderateScale(20)}
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
    content: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    chartSection: {
      paddingVertical: moderateScale(SPACING["2xl"]),
      paddingHorizontal: moderateScale(SPACING.lg),
    },
    chartCard: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(BORDER_RADIUS.lg),
      padding: moderateScale(SPACING["xl"]),
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
      marginBottom: moderateScale(SPACING.lg),
    },
    pieChartWrapper: {
      width: moderateScale(180),
      height: moderateScale(180),
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    outerRing: {
      position: "absolute",
      width: moderateScale(180),
      height: moderateScale(180),
      borderRadius: moderateScale(100),
      borderWidth: 2,
    },
    pieBase: {
      width: moderateScale(140),
      height: moderateScale(140),
      borderRadius: moderateScale(80),
      position: "relative",
      overflow: "hidden",
    },
    completedSegment: {
      position: "absolute",
      width: moderateScale(140),
      height: moderateScale(140),
      borderRadius: moderateScale(80),
      borderWidth: moderateScale(20),
      borderColor: "transparent",
      borderTopColor: theme.colors.primary,
      borderRightColor: theme.colors.primary,
    },
    remainingSegment: {
      position: "absolute",
      width: moderateScale(140),
      height: moderateScale(140),
      borderRadius: moderateScale(80),
      borderWidth: moderateScale(20),
      borderColor: "transparent",
    },
    centerCircle: {
      position: "absolute",
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: moderateScale(60),
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
      fontSize: moderateScale(30),
      fontWeight: "bold",
      marginBottom: moderateScale(2),
    },
    centerLabel: {
      fontSize: moderateScale(FONT_SIZES.xs),
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
      fontSize: moderateScale(FONT_SIZES.lg),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: moderateScale(SPACING.xs),
      textAlign: "center",
    },
    progressSubtitle: {
      fontSize: moderateScale(FONT_SIZES.sm),
      color: theme.colors.textMuted,
      textAlign: "center",
    },
    courseStatsSection: {
      paddingHorizontal: moderateScale(SPACING.base),
      paddingBottom: moderateScale(SPACING["xl"]),
    },
    sectionTitle: {
      fontSize: moderateScale(FONT_SIZES.lg),
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: moderateScale(SPACING.lg),
      paddingHorizontal: moderateScale(SPACING.xs),
    },
    skeletonContainer: {
      marginBottom: moderateScale(SPACING.base),
    },
    courseStatItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: moderateScale(SPACING.base),
      paddingVertical: moderateScale(SPACING.base),
      marginBottom: moderateScale(SPACING.sm),
      borderRadius: moderateScale(BORDER_RADIUS.base),
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
    },
    subjectIcon: {
      width: moderateScale(52),
      height: moderateScale(52),
      borderRadius: moderateScale(14),
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACING.base,
    },
    subjectIconInner: {
      width: moderateScale(36),
      height: moderateScale(36),
      borderRadius: moderateScale(10),
      alignItems: "center",
      justifyContent: "center",
    },
    subjectIconText: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: "white",
    },
    courseStatContent: {
      flex: 1,
      paddingRight: moderateScale(SPACING.base),
    },
    courseStatHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: moderateScale(SPACING.xs),
    },
    courseStatName: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
    },
    percentageBadge: {
      paddingHorizontal: moderateScale(SPACING.sm),
      paddingVertical: moderateScale(SPACING.xs / 2),
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      marginLeft: moderateScale(SPACING.sm),
    },
    percentageText: {
      fontSize: moderateScale(FONT_SIZES.xs),
      fontWeight: "bold",
    },
    courseStatDetails: {
      gap: SPACING.xs,
    },
    courseStatSubtext: {
      fontSize: moderateScale(FONT_SIZES.xs),
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
