import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import {
  Theme,
  SubjectStatistic,
  ChapterStatistic,
  ThemeStatistic,
} from "../../types";
import { SPACING, FONT_SIZES, BORDER_RADIUS } from "../../utils";
import { useStatistics, useChapterStatistics } from "../../hooks/useStatistics";
import { Skeleton } from "../../components/Skeleton";

export default function StatistikaScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // State management
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectStatistic | null>(null);
  const [currentView, setCurrentView] = useState<"subjects" | "chapters">(
    "subjects"
  );

  // Fetch statistics data
  const { data: statistics, isLoading, error, refetch } = useStatistics();
  const {
    data: chapterStatistics,
    isLoading: chapterLoading,
    error: chapterError,
    refetch: refetchChapters,
  } = useChapterStatistics(selectedSubject?.subjectId || 0);

  const handleGoBack = () => {
    if (currentView === "chapters") {
      // Go back to subjects view
      setCurrentView("subjects");
      setSelectedSubject(null);
    } else {
      // Go back to previous screen
      navigation.goBack();
    }
  };

  const handleSubjectPress = (subject: SubjectStatistic) => {
    setSelectedSubject(subject);
    setCurrentView("chapters");
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

  // Show error alert if API call fails
  if (error) {
    Alert.alert(
      "Xatolik",
      "Statistika ma'lumotlarini yuklashda xatolik yuz berdi.",
      [
        { text: "Qayta urinish", onPress: () => refetch() },
        { text: "Bekor qilish", style: "cancel" },
      ]
    );
  }

  // Get color for subject based on percentage
  const getSubjectColor = (percentage: number) => {
    if (percentage >= 80) return theme.colors.success;
    if (percentage >= 60) return theme.colors.primary;
    if (percentage >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentView === "subjects"
            ? "Statistika"
            : selectedSubject?.subjectName || "Statistika"}
        </Text>
        <View style={styles.headerIndicator}>
          <View style={styles.dotIndicator} />
        </View>
      </View>

      {/* Content */}
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
                    <Text style={styles.centerLabel}>Progress</Text>
                  </View>
                </View>

                {/* 3D shadow effect */}
                <View
                  style={[
                    styles.pieShadow,
                    {
                      backgroundColor: theme.colors.shadow,
                      opacity: theme.isDark ? 0.4 : 0.2,
                    },
                  ]}
                />
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

        {/* Conditional Content Based on Current View */}
        {currentView === "subjects" ? (
          /* Subject Statistics */
          <View style={styles.courseStatsSection}>
            <Text style={styles.sectionTitle}>Fanlar bo'yicha natijalar</Text>

            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.skeletonContainer}>
                  <Skeleton height={80} radius={16} />
                </View>
              ))
            ) : statistics &&
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
                  activeOpacity={0.7}
                  onPress={() => handleSubjectPress(stat)}
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
        ) : (
          /* Chapter Statistics */
          <View style={styles.courseStatsSection}>
            <Text style={styles.sectionTitle}>Boblar bo'yicha natijalar</Text>

            {chapterLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.skeletonContainer}>
                  <Skeleton height={120} radius={16} />
                </View>
              ))
            ) : chapterStatistics &&
              Array.isArray(chapterStatistics) &&
              chapterStatistics.length > 0 ? (
              chapterStatistics.map((chapter: ChapterStatistic) => (
                <View
                  key={chapter.id}
                  style={[
                    styles.chapterStatItem,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        theme.colors.border + (theme.isDark ? "30" : "50"),
                    },
                  ]}
                >
                  {/* Chapter Header */}
                  <View style={styles.chapterHeader}>
                    <View style={styles.chapterTitleContainer}>
                      <Text style={styles.chapterTitle}>{chapter.name}</Text>
                      <Text style={styles.chapterSubtitle}>
                        {chapter.themes.length} ta mavzu
                      </Text>
                    </View>
                    <View style={styles.chapterBadge}>
                      <Text style={styles.chapterNumber}>
                        {chapter.ordinalNumber}
                      </Text>
                    </View>
                  </View>

                  {/* Themes List */}
                  <View style={styles.themesContainer}>
                    {chapter.themes.map((themeData: ThemeStatistic) => (
                      <View key={themeData.id} style={styles.themeItem}>
                        <View style={styles.themeInfo}>
                          <Text style={styles.themeName}>{themeData.name}</Text>
                          <View
                            style={[
                              styles.themeProgressBar,
                              {
                                backgroundColor:
                                  theme.colors.divider +
                                  (theme.isDark ? "30" : "50"),
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.themeProgressFill,
                                {
                                  width: `${themeData.percent}%`,
                                  backgroundColor: getSubjectColor(
                                    themeData.percent
                                  ),
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.themePercent,
                            { color: getSubjectColor(themeData.percent) },
                          ]}
                        >
                          {themeData.percent}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
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
                    name="library-outline"
                    size={32}
                    color={theme.colors.textMuted}
                  />
                </View>
                <Text style={styles.emptyStateTitle}>
                  Bob statistikalari mavjud emas
                </Text>
                <Text style={styles.emptyStateText}>
                  Ushbu fan bo'yicha hozircha bob statistikalari mavjud emas.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Refresh Button */}
        {error && (
          <View style={styles.refreshSection}>
            <TouchableOpacity
              onPress={() => refetch()}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.refreshButtonText}>Qayta yuklash</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
    refreshSection: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
      alignItems: "center",
    },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      gap: SPACING.xs,
    },
    refreshButtonText: {
      color: "white",
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
    },

    // Chapter Statistics Styles
    chapterStatItem: {
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      marginBottom: SPACING.base,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
    },
    chapterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SPACING.base,
    },
    chapterTitleContainer: {
      flex: 1,
      marginRight: SPACING.base,
    },
    chapterTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
    },
    chapterSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textMuted,
    },
    chapterBadge: {
      backgroundColor: theme.colors.primary + "20",
      borderRadius: BORDER_RADIUS.sm,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      minWidth: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    chapterNumber: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    themesContainer: {
      gap: SPACING.sm,
    },
    themeItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.xs,
    },
    themeInfo: {
      flex: 1,
      marginRight: SPACING.base,
    },
    themeName: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
      marginBottom: SPACING.xs,
      lineHeight: FONT_SIZES.base * 1.3,
    },
    themeProgressBar: {
      height: 6,
      borderRadius: 3,
      overflow: "hidden",
    },
    themeProgressFill: {
      height: "100%",
      borderRadius: 3,
      minWidth: 2,
    },
    themePercent: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "600",
      minWidth: 40,
      textAlign: "right",
    },
  });
