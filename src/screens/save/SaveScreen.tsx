import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBookmark } from "../../context/BookmarkContext";
import { useTheme } from "../../context/ThemeContext";
import { SPACING, FONT_SIZES } from "../../utils";
import { BookmarkedLesson, Theme } from "../../types";
import PageCard from "@/src/components/ui/cards/PageCard";
import { moderateScale } from "react-native-size-matters";

export default function SaveScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const {
    bookmarkedLessons,
    getBookmarksByCategory,
    isLoading,
    removeBookmark,
  } = useBookmark();

  const categorizedBookmarks = getBookmarksByCategory();
  const categoryKeys = Object.keys(categorizedBookmarks);

  const handleLessonPress = (lesson: BookmarkedLesson) => {
    (navigation as any).navigate("LessonDetail", {
      themeId: lesson.id,
      themeOrdinalNumber: lesson.mavzu.split("-")[0],
      themeName: lesson.title,
    });
  };

  const handleRemoveBookmark = async (lesson: BookmarkedLesson) => {
    await removeBookmark(lesson.id, lesson.courseType);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (bookmarkedLessons.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="bookmark-outline"
            size={64}
            color={theme.colors.textMuted}
          />
          <Text style={styles.emptyTitle}>Saqlangan darslar yo'q</Text>
          <Text style={styles.emptySubtitle}>
            Darslarni saqlash uchun bookmark tugmasini bosing
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Content */}
      <PageCard>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {categoryKeys.map((categoryName) => {
            const lessons = categorizedBookmarks[categoryName];
            return (
              <View key={categoryName} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{categoryName}</Text>

                {lessons
                  .sort((a, b) => a.id - b.id)
                  .map((lesson) => (
                    <TouchableOpacity
                      key={`${lesson.id}-${lesson.courseType}`}
                      style={styles.lessonItem}
                      onPress={() => handleLessonPress(lesson)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.lessonIcon}>
                        <Ionicons
                          name="lock-closed"
                          size={moderateScale(16)}
                          color={theme.colors.success}
                        />
                      </View>

                      <View style={styles.lessonContent}>
                        <Text style={styles.lessonTitle}>{lesson.mavzu}</Text>
                        <Text style={styles.lessonSubtitle}>
                          {lesson.title}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveBookmark(lesson)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="close"
                          size={moderateScale(16)}
                          color={theme.colors.textMuted}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
              </View>
            );
          })}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </PageCard>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: SPACING.base,
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
      fontSize: moderateScale(FONT_SIZES.lg),
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: moderateScale(SPACING.sm),
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: moderateScale(FONT_SIZES.sm),
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: SPACING.xs,
      lineHeight: 22,
    },
    content: {
      flex: 1,
      backgroundColor: theme.colors.card,
    },
    categorySection: {
      marginTop: moderateScale(SPACING.xs),
    },
    categoryTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: theme.colors.text,
      paddingHorizontal: moderateScale(SPACING.base),
      paddingBottom: moderateScale(SPACING.xs),
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: SPACING.base,
    },
    lessonItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingHorizontal: moderateScale(SPACING.base),
      paddingVertical: moderateScale(SPACING.sm),
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.border,
    },
    lessonIcon: {
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(14),
      backgroundColor: theme.colors.success + "20", // 20% opacity
      justifyContent: "center",
      alignItems: "center",
      marginRight: moderateScale(SPACING.sm),
    },
    lessonContent: {
      flex: 1,
    },
    lessonTitle: {
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 2,
    },
    lessonSubtitle: {
      fontSize: moderateScale(FONT_SIZES.xs-1),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(16),
    },
    removeButton: {
      padding: SPACING.xs,
    },
    bottomSpacing: {
      height: SPACING.xl,
    },
  });
