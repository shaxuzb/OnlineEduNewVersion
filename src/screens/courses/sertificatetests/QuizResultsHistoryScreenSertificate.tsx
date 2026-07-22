import ErrorData from "@/src/components/exceptions/ErrorData";
import EmptyData from "@/src/components/exceptions/EmptyData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useQuizResultsHistory } from "@/src/hooks/useQuiz";
import { QuizResultHistoryItem, Theme } from "@/src/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

const BRAND_GRADIENT = ["#3a5dde", "#5e84e6"] as const;

type Styles = ReturnType<typeof createStyles>;
type ResultStatus = "fail" | "pass" | "best";

const pad = (n: number) => String(n).padStart(2, "0");
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
};
const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// ── Status visuals (red = no score, green = passed, amber = personal best) ─────
interface StatusVisual {
  solid: string;
  tint: string;
  icon: keyof typeof Ionicons.glyphMap;
}
const STATUS_VISUALS: Record<ResultStatus, StatusVisual> = {
  fail: { solid: "#E5484D", tint: "#FDEDED", icon: "close" },
  pass: { solid: "#1FA85A", tint: "#E7F6EE", icon: "checkmark" },
  best: { solid: "#F5A524", tint: "#FEF2E0", icon: "stats-chart" },
};

// ── Memoized result row (receives primitives only) ────────────────────────────
const ResultCard = memo(function ResultCard({
  date,
  time,
  score,
  maxScore,
  percent,
  status,
  styles,
}: {
  date: string;
  time: string;
  score: number;
  maxScore: number;
  percent: number;
  status: ResultStatus;
  styles: Styles;
}) {
  const v = STATUS_VISUALS[status];
  return (
    <View style={styles.card}>
      <View style={[styles.statusCircle, { backgroundColor: v.solid }]}>
        <Ionicons name={v.icon} size={moderateScale(20)} color="#fff" />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardRow}>
          <Text style={styles.dateText}>{date}</Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.scoreText}>
            {score}
            <Text style={styles.scoreTotal}> / {maxScore}</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: v.tint }]}>
            <Text style={[styles.badgeText, { color: v.solid }]}>
              {Math.round(percent)}%
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={moderateScale(18)}
        color={styles.chevron.color}
      />
    </View>
  );
});

// ── Hero stat column ──────────────────────────────────────────────────────────
const HeroStat = memo(function HeroStat({
  value,
  label,
  styles,
}: {
  value: string;
  label: string;
  styles: Styles;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.heroStatLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
});

export default function QuizResultsHistoryScreenSertificate({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { userId, themeId } = route.params;

  const { data, isLoading, error, refetch } = useQuizResultsHistory(
    Number(userId),
    Number(themeId),
  );

  // Newest first
  const items = useMemo<QuizResultHistoryItem[]>(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return [...data].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [data]);

  // Everything in the hero card is computed from the data.
  const stats = useMemo(() => {
    if (items.length === 0) {
      return {
        title: "",
        count: 0,
        highest: 0,
        average: 0,
        lastScore: 0,
        best: 0,
      };
    }
    const percents = items.map((i) => i.percent);
    const scores = items.map((i) => i.score);
    const sum = percents.reduce((a, b) => a + b, 0);
    return {
      title: route.params?.themeName ?? items[0].testName ?? "Test natijalari",
      count: items.length,
      highest: Math.round(Math.max(...percents)),
      average: Math.round(sum / items.length),
      lastScore: items[0].score, // most recent attempt
      best: Math.max(...scores), // personal-best score (drives the amber icon)
    };
  }, [items, route.params?.themeName]);

  const getStatus = useCallback(
    (score: number): ResultStatus => {
      if (score <= 0) return "fail";
      if (score === stats.best && stats.best > 0) return "best";
      return "pass";
    },
    [stats.best],
  );

  const keyExtractor = useCallback(
    (item: QuizResultHistoryItem) => String(item.id),
    [],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<QuizResultHistoryItem>) => (
      <ResultCard
        date={formatDate(item.createdAt)}
        time={formatTime(item.createdAt)}
        score={item.score}
        maxScore={item.maxScore}
        percent={item.percent}
        status={getStatus(item.score)}
        styles={styles}
      />
    ),
    [getStatus, styles],
  );

  const listHeader = useMemo(
    () => (
      <LinearGradient
        colors={BRAND_GRADIENT as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroCardMain}>
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {stats.title}
            </Text>
            <View style={styles.heroIconCircle}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={moderateScale(22)}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.heroStatsRow}>
            <HeroStat
              value={String(stats.count)}
              label="Testlar"
              styles={styles}
            />
            <HeroStat
              value={`${stats.highest}%`}
              label="Eng yuqori"
              styles={styles}
            />
            <HeroStat
              value={`${stats.average}%`}
              label="O'rtacha"
              styles={styles}
            />
            <HeroStat
              value={String(stats.lastScore)}
              label="So'nggi ball"
              styles={styles}
            />
          </View>
        </View>
      </LinearGradient>
    ),
    [styles, stats],
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} />
      <SafeAreaView edges={["top"]} style={styles.navSafeArea}>
        {/* Fixed nav header */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={moderateScale(24)}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Tarixni ko'rish</Text>
          <View style={styles.navBtn} />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <LoadingData />
      ) : error ? (
        <ErrorData refetch={refetch} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<EmptyData />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={9}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // ── Nav header ───────────────────────────────────────────
    navSafeArea: {
      backgroundColor: theme.colors.background,
    },
    navRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: moderateScale(12),
      paddingVertical: moderateScale(8),
    },
    navBtn: {
      width: moderateScale(40),
      height: moderateScale(40),
      alignItems: "center",
      justifyContent: "center",
    },
    navTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: moderateScale(18),
      fontWeight: "700",
      color: theme.colors.text,
    },

    // ── List ─────────────────────────────────────────────────
    listContent: {
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(28),
      flexGrow: 1,
    },

    // ── Hero card ────────────────────────────────────────────
    heroCardMain: {
      borderRadius: moderateScale(20),
      padding: moderateScale(18),
    },
    heroCard: {
      borderRadius: moderateScale(20),
      marginTop: moderateScale(8),
      marginBottom: moderateScale(18),
      shadowColor: "#1b2a6b",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.22,
      shadowRadius: 16,
      elevation: 8,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: moderateScale(12),
      marginBottom: moderateScale(18),
    },
    heroTitle: {
      flex: 1,
      color: "#fff",
      fontSize: moderateScale(19),
      fontWeight: "800",
      lineHeight: moderateScale(25),
    },
    heroIconCircle: {
      width: moderateScale(44),
      height: moderateScale(44),
      borderRadius: moderateScale(14),
      backgroundColor: "rgba(255,255,255,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroStatsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    heroStat: {
      flex: 1,
    },
    heroStatValue: {
      color: "#fff",
      fontSize: moderateScale(21),
      fontWeight: "800",
    },
    heroStatLabel: {
      color: "rgba(255,255,255,0.82)",
      fontSize: moderateScale(11),
      marginTop: moderateScale(2),
    },

    // ── Result card ──────────────────────────────────────────
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(16),
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(12),
      marginBottom: moderateScale(12),
      gap: moderateScale(12),
      shadowColor: "#1b2a6b",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.isDark ? 0.3 : 0.08,
      shadowRadius: 10,
      elevation: 4,
    },
    statusCircle: {
      width: moderateScale(42),
      height: moderateScale(42),
      borderRadius: moderateScale(21),
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      flex: 1,
      gap: moderateScale(6),
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateText: {
      fontSize: moderateScale(13),
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    timeText: {
      fontSize: moderateScale(12),
      color: theme.colors.textMuted,
    },
    scoreText: {
      fontSize: moderateScale(18),
      fontWeight: "800",
      color: theme.colors.text,
    },
    scoreTotal: {
      fontSize: moderateScale(13),
      fontWeight: "600",
      color: theme.colors.textMuted,
    },
    badge: {
      minWidth: moderateScale(48),
      paddingHorizontal: moderateScale(10),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(10),
      alignItems: "center",
    },
    badgeText: {
      fontSize: moderateScale(13),
      fontWeight: "800",
    },
    chevron: {
      color: theme.colors.textMuted,
    },
  });
