import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  InteractionManager,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeStatistics } from "@/src/hooks/useStatistics";
import { ChapterThemeStatistic, Theme } from "@/src/types";
import LoadingData from "@/src/components/exceptions/LoadingData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import NoTestResultsModal from "../components/NoTestResultsModal";
import { moderateScale } from "react-native-size-matters";

export default function StatistikaSubjectScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [noTestResult, setNoTestResult] = useState(false);
  const [chapterThemeData, setChapterThemeData] = useState<{
    themeId: number;
    themeOrdinalNumber: number;
    themeName: string;
  } | null>(null);
  const { userId, subjectId, subjectName, subjectPercent } = route.params;

  const { data, isLoading, isError, refetch } = useThemeStatistics(
    Number(userId),
    Number(subjectId)
  );
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refetch();
    });
    return () => task.cancel();
  }, []);

  const handleThemePress = useCallback(
    (chapterTheme: ChapterThemeStatistic) => {
      if (!chapterTheme.isLocked && chapterTheme.testId) {
        navigation.navigate("StatistikaDetailTest", {
          subjectId,
          testId: chapterTheme.testId,
          themeId: chapterTheme.id,
          themePercent: chapterTheme.percent,
          userId,
          themeName: `${chapterTheme.ordinalNumber}-${chapterTheme.name}`,
        });
      } else {
        setNoTestResult(true);
        setChapterThemeData({
          themeId: chapterTheme.id,
          themeName: chapterTheme.name,
          themeOrdinalNumber: chapterTheme.ordinalNumber,
        });
      }
    },
    [navigation, subjectId, userId, chapterThemeData]
  );
  useEffect(() => {
    navigation.setOptions({
      title: subjectName.toString(),
      freezeOnBlur: true,
      headerRight: () => (
        <Text style={{ color: "white", fontSize: moderateScale(14) }}>{subjectPercent}%</Text>
      ),
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {isLoading ? (
        <LoadingData />
      ) : isError ? (
        <ErrorData refetch={refetch} />
      ) : (
        <SectionList
          sections={
            data?.map((chapter) => ({
              title: `${chapter.ordinalNumber}-bob. ${chapter.name}`,
              data: chapter.themes,
            })) ?? []
          }
          keyExtractor={(item, index) => item.id.toString() + index}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.chapterSectionTitle}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <ThemeItem
              key={item.id}
              chapterTheme={item}
              onPress={handleThemePress}
              theme={theme}
              styles={styles}
            />
          )}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={2}
          scrollEnabled
          contentContainerStyle={styles.content}
        />
      )}
      <NoTestResultsModal
        visible={noTestResult}
        onClose={() => setNoTestResult(false)}
      />
    </SafeAreaView>
  );
}
/* --- Theme Item (Memoized) --- */
const ThemeItem = React.memo(
  ({ chapterTheme, onPress, theme, styles }: any) => (
    <TouchableOpacity
      style={[
        styles.themeCard,
        chapterTheme.isLocked && styles.lockedThemeCard,
      ]}
      onPress={() => onPress(chapterTheme)}
      disabled={chapterTheme.isLocked}
    >
      <View style={styles.themeLeft}>
        <View style={styles.lockIconContainer}>
          <Ionicons
            name={chapterTheme.isLocked ? "lock-closed" : "lock-open"}
            size={moderateScale(14)}
            color={
              chapterTheme.isLocked
                ? theme.colors.textMuted
                : theme.colors.success
            }
          />
        </View>
        <View style={styles.themeInfo}>
          <Text style={styles.themeNumber}>
            {chapterTheme.ordinalNumber}-mavzu:
          </Text>
          <Text
            style={[
              styles.themeName,
              chapterTheme.isLocked && styles.lockedThemeName,
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {chapterTheme.name}
          </Text>
        </View>
        {chapterTheme.testId && (
          <Text style={styles.percentText}>{chapterTheme.percent}%</Text>
        )}
      </View>
    </TouchableOpacity>
  )
);

/* --- Styles --- */
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: moderateScale(12),
      paddingTop: moderateScale(3),
    },

    retryBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryText: {
      color: "white",
      fontWeight: "600",
    },
    themeCard: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(10),
      padding: moderateScale(14),
      marginBottom: moderateScale(10),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    lockedThemeCard: {
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
    },
    themeLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    lockIconContainer: {
      marginRight: 12,
    },
    themeNumber: {
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: moderateScale(14),
      color: theme.colors.text,
      lineHeight: 20,
    },
    lockedThemeName: {
      color: theme.colors.textMuted,
    },
    chapterSectionTitle: {
      fontSize: moderateScale(16),
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    percentText: {
      color: theme.colors.text,
      fontSize: moderateScale(12),
    },
  });
