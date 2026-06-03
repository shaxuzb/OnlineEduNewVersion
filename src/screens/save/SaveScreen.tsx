import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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

type SaveStyles = ReturnType<typeof createStyles>;

interface BookmarkSection {
  title: string;
  data: BookmarkedLesson[];
}

// ── Memoized row — only re-renders when its own props change ───────────────────
const BookmarkRow = React.memo(function BookmarkRow({
  lesson,
  onPress,
  onRemove,
  theme,
  styles,
}: {
  lesson: BookmarkedLesson;
  onPress: (lesson: BookmarkedLesson) => void;
  onRemove: (lesson: BookmarkedLesson) => void;
  theme: Theme;
  styles: SaveStyles;
}) {
  return (
    <TouchableOpacity
      style={styles.lessonItem}
      onPress={() => onPress(lesson)}
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
        <Text style={styles.lessonSubtitle}>{lesson.title}</Text>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(lesson)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="close"
          size={moderateScale(16)}
          color={theme.colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function SaveScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    bookmarkedLessons,
    getBookmarksByCategory,
    isLoading,
    removeBookmark,
  } = useBookmark();

  // Derive sections from the bookmark source of truth.
  // Copy before sorting so we never mutate the underlying array (was a bug).
  const sections: BookmarkSection[] = useMemo(() => {
    const categorized = getBookmarksByCategory();
    return Object.keys(categorized).map((categoryName) => ({
      title: categoryName,
      data: [...categorized[categoryName]].sort((a, b) => a.id - b.id),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedLessons]);

  const handleLessonPress = useCallback(
    (lesson: BookmarkedLesson) => {
      (navigation as any).navigate("LessonDetail", {
        themeId: lesson.id,
        themeOrdinalNumber: lesson.mavzu.split("-")[0],
        themeName: lesson.title,
      });
    },
    [navigation],
  );

  const handleRemoveBookmark = useCallback(
    (lesson: BookmarkedLesson) => {
      void removeBookmark(lesson.id, lesson.courseType);
    },
    [removeBookmark],
  );

  const keyExtractor = useCallback(
    (item: BookmarkedLesson) => `${item.id}-${item.courseType}`,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: BookmarkedLesson }) => (
      <BookmarkRow
        lesson={item}
        onPress={handleLessonPress}
        onRemove={handleRemoveBookmark}
        theme={theme}
        styles={styles}
      />
    ),
    [handleLessonPress, handleRemoveBookmark, theme, styles],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: BookmarkSection }) => (
      <Text style={styles.categoryTitle}>{section.title}</Text>
    ),
    [styles],
  );

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
      <PageCard>
        <SectionList
          style={styles.content}
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
        />
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
    listContent: {
      paddingBottom: SPACING.xl,
    },
    categoryTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: theme.colors.text,
      backgroundColor: theme.colors.card,
      paddingHorizontal: moderateScale(SPACING.base),
      paddingTop: moderateScale(SPACING.sm),
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
      fontSize: moderateScale(FONT_SIZES.xs - 1),
      color: theme.colors.textSecondary,
      lineHeight: moderateScale(16),
    },
    removeButton: {
      padding: SPACING.xs,
    },
  });
