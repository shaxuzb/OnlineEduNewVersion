import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import {
  ChapterWithThemes,
  ChapterTheme,
  RootStackParamList,
  Theme,
} from "../../types";
import { useThemes } from "../../hooks/useThemes";

export default function SubjectScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { subjectId, subjectName } =
    route.params as RootStackParamList["SubjectScreen"];

  const { data, isLoading, isError, refetch } = useThemes(subjectId);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleThemePress = (chapterTheme: ChapterTheme) => {
    if (!chapterTheme.isLocked) {
      (navigation as any).navigate("LessonDetail", {
        themeId: chapterTheme.id,
        themeOrdinalNumber: chapterTheme.ordinalNumber,
        themeName: chapterTheme.name,
      });
    }
  };

  // Add custom isLocked logic (first theme unlocked, others locked)
  const processDataWithLocking = (data: ChapterWithThemes[]) => {
    return data.map((chapter) => ({
      ...chapter,
      themes: chapter.themes.map((theme, index) => ({
        ...theme,
        isLocked: false, // First theme unlocked, others locked
      })),
    }));
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subjectName}</Text>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subjectName}</Text>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Xatolik yuz berdi. Qayta urinib ko'ring.
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Qayta yuklash</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subjectName}</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {processDataWithLocking(data?.results || []).map((chapter) => (
          <View key={chapter.id}>
            {/* Chapter Title */}
            <Text style={styles.chapterSectionTitle}>
              {chapter.ordinalNumber}-bob. {chapter.name}
            </Text>

            {/* Chapter Themes */}
            {chapter.themes.map((chapterTheme) => (
              <TouchableOpacity
                key={chapterTheme.id}
                style={[
                  styles.themeCard,
                  chapterTheme.isLocked && styles.lockedThemeCard,
                ]}
                onPress={() => handleThemePress(chapterTheme)}
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
                </View>
                {!chapterTheme.isLocked && (
                  <Ionicons
                    name="hand-left"
                    size={20}
                    color={theme.colors.warning}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    profileBtn: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 50,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      color: theme.colors.textSecondary,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 12,
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
    chapterCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chapterLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    chapterInfo: {
      flex: 1,
    },
    chapterTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    chapterName: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 4,
    },
    themeCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    chapterContainer: {
      marginBottom: 8,
    },
    chapterRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    themesContainer: {
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 12,
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
  });
