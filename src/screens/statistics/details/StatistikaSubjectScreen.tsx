import React, { useCallback, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "@/src/context/ThemeContext";
import { ChapterThemeStatistic, Theme } from "@/src/types";
import { useThemeStatistics } from "@/src/hooks/useStatistics";
import LoadingData from "@/src/components/exceptions/LoadingData";
import ErrorData from "@/src/components/exceptions/ErrorData";

export default function StatistikaSubjectScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { userId, subjectId, subjectName, subjectPercent } =
    route.params as any;

  const { data, isLoading, isError, refetch } = useThemeStatistics(
    userId,
    subjectId
  );
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      refetch();
    });
    return () => task.cancel();
  }, []);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleThemePress = useCallback(
    (chapterTheme: ChapterThemeStatistic) => {
      if (!chapterTheme.isLocked) {
        (navigation as any).navigate("StatistikaDetailTest", {
          subjectId,
          testId: 25,
          themePercent: chapterTheme.percent,
          userId,
          themeName: `${chapterTheme.ordinalNumber}-${chapterTheme.name}`,
        });
      }
    },
    [navigation, subjectId, userId]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <Header
        title={subjectName}
        onBack={handleGoBack}
        theme={theme}
        right={
          <Text style={{ color: theme.colors.text, fontSize: 20 }}>
            {subjectPercent}%
          </Text>
        }
      />

      {isLoading ? (
        <LoadingData />
      ) : isError ? (
        <ErrorData refetch={refetch} />
      ) : (
        <ScrollView style={styles.content}>
          {data?.map((chapter) => (
            <View key={chapter.id}>
              <Text style={styles.chapterSectionTitle}>
                {chapter.ordinalNumber}-bob. {chapter.name}
              </Text>

              {chapter.themes.map((chapterTheme) => (
                <ThemeItem
                  key={chapterTheme.id}
                  chapterTheme={chapterTheme}
                  onPress={handleThemePress}
                  theme={theme}
                  styles={styles}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* --- Header Component --- */
const Header = ({ title, onBack, right, theme }: any) => (
  <View style={headerStyles(theme).header}>
    <TouchableOpacity onPress={onBack} style={headerStyles(theme).backButton}>
      <Ionicons name="chevron-back" size={24} color="white" />
    </TouchableOpacity>
    <Text style={headerStyles(theme).headerTitle}>{title}</Text>
    {right}
  </View>
);

const ProfileButton = () => (
  <TouchableOpacity
    style={{
      backgroundColor: "rgba(255,255,255,0.2)",
      padding: 8,
      borderRadius: 50,
    }}
  >
    <Ionicons name="person" size={24} color="white" />
  </TouchableOpacity>
);

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
            size={16}
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
        <Text style={styles.percentText}>{chapterTheme.percent}%</Text>
      </View>
    </TouchableOpacity>
  )
);

/* --- Styles --- */
const headerStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      padding: 20,
      paddingTop: 16,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
  });

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 5,
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
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
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
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 20,
    },
    lockedThemeName: {
      color: theme.colors.textMuted,
    },
    chapterSectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    percentText: {
      color: theme.colors.text,
    },
  });
