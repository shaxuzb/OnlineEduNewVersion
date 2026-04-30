import { useTheme } from "@/src/context/ThemeContext";
import { useQuizResultsHistory } from "@/src/hooks/useQuiz";
import { QuizResultHistoryItem, Theme } from "@/src/types";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

interface HistorySection {
  title: string;
  dateKey: string;
  data: QuizResultHistoryItem[];
}

const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTimeLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateKey = (isoDate: string) => {
  const date = new Date(isoDate);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function QuizResultsHistoryScreenSertificate({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const insets = useSafeAreaInsets();
  const { userId, themeId } = route.params;

  const {
    data: historyData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuizResultsHistory(Number(userId), Number(themeId));

  const sections = useMemo<HistorySection[]>(() => {
    if (!historyData || historyData.length === 0) {
      return [];
    }

    const sorted = [...historyData].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const grouped = sorted.reduce(
      (acc, item) => {
        const dateKey = toDateKey(item.createdAt);
        if (!acc[dateKey]) {
          acc[dateKey] = {
            dateKey,
            title: formatDateLabel(item.createdAt),
            data: [],
          };
        }
        acc[dateKey].data.push(item);
        return acc;
      },
      {} as Record<string, HistorySection>,
    );

    return Object.values(grouped).sort((a, b) =>
      b.dateKey.localeCompare(a.dateKey),
    );
  }, [historyData]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      presentation: "transparentModal",
      animation: "slide_from_bottom",
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.overlay} edges={["bottom"]}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Ishlangan testlar tarixi</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="close"
              size={moderateScale(20)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {isLoading || isFetching ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.stateText}>Tarix yuklanmoqda...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Text style={styles.errorText}>
              Tarixni yuklashda xatolik yuz berdi.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => refetch()}
            >
              <Text style={styles.retryText}>Qayta yuklash</Text>
            </TouchableOpacity>
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyText}>Tarix ma'lumotlari topilmadi.</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: moderateScale(24) + insets.bottom },
            ]}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.testName} numberOfLines={1}>
                    {item.testName}
                  </Text>
                  <Text style={styles.timeText}>
                    {formatTimeLabel(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metricChip}>
                    <Text style={styles.metricLabel}>Ball</Text>
                    <Text style={styles.metricValue}>
                      {item.score}/{item.maxScore}
                    </Text>
                  </View>
                  <View style={styles.metricChip}>
                    <Text style={styles.metricLabel}>Foiz</Text>
                    <Text style={styles.metricValue}>{item.percent}%</Text>
                  </View>
                  {item.degree && (
                    <View style={styles.metricChip}>
                      <Text style={styles.metricLabel}>
                        Sertifikat darajasi
                      </Text>
                      <Text style={styles.metricValue}>{item.degree}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      justifyContent: "flex-end",
    },
    sheet: {
      height: "90%",
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: moderateScale(BORDER_RADIUS.lg),
      borderTopRightRadius: moderateScale(BORDER_RADIUS.lg),
      paddingHorizontal: moderateScale(SPACING.base),
      paddingTop: moderateScale(SPACING.xs),
    },
    handle: {
      alignSelf: "center",
      width: moderateScale(44),
      height: moderateScale(4),
      borderRadius: moderateScale(2),
      backgroundColor: theme.colors.textMuted,
      marginTop: moderateScale(SPACING.xs),
      marginBottom: moderateScale(SPACING.sm),
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: moderateScale(SPACING.sm),
      gap: moderateScale(SPACING.sm),
    },
    headerTitleWrap: {
      flex: 1,
    },
    headerTitle: {
      color: theme.colors.text,
      fontSize: moderateScale(FONT_SIZES.lg),
      fontWeight: "700",
    },
    closeButton: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(16),
      backgroundColor: theme.colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      paddingBottom: moderateScale(24),
      gap: moderateScale(SPACING.xs),
    },
    sectionTitle: {
      color: theme.colors.text,
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "700",
      marginTop: moderateScale(SPACING.xs),
      marginBottom: moderateScale(SPACING.xs),
    },
    card: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: moderateScale(BORDER_RADIUS.base),
      paddingHorizontal: moderateScale(SPACING.sm),
      paddingVertical: moderateScale(SPACING.sm),
      marginBottom: moderateScale(SPACING.xs),
      gap: moderateScale(SPACING.xs),
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: moderateScale(SPACING.sm),
    },
    testName: {
      flex: 1,
      color: theme.colors.text,
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "600",
    },
    timeText: {
      color: theme.colors.textMuted,
      fontSize: moderateScale(FONT_SIZES.xs),
      fontWeight: "500",
    },
    metricsRow: {
      flexDirection: "row",
      gap: moderateScale(SPACING.xs),
    },
    metricChip: {
      flex: 1,
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: moderateScale(SPACING.xs),
      paddingVertical: moderateScale(6),
    },
    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: moderateScale(FONT_SIZES.xs),
      marginBottom: moderateScale(2),
    },
    metricValue: {
      color: theme.colors.text,
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "700",
    },
    centerState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: moderateScale(SPACING.sm),
      paddingHorizontal: moderateScale(SPACING.base),
    },
    stateText: {
      color: theme.colors.text,
      fontSize: moderateScale(FONT_SIZES.sm),
    },
    emptyText: {
      color: theme.colors.textMuted,
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "500",
    },
    errorText: {
      color: theme.colors.error,
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "600",
      textAlign: "center",
    },
    retryButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      paddingHorizontal: moderateScale(SPACING.base),
      paddingVertical: moderateScale(SPACING.xs),
    },
    retryText: {
      color: theme.colors.primary,
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "600",
    },
  });
