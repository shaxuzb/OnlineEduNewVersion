import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBookmark } from '../../context/BookmarkContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';
import { BookmarkedLesson, Theme } from '../../types';

export default function SaveScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { bookmarkedLessons, getBookmarksByCategory, isLoading, removeBookmark } = useBookmark();

  const categorizedBookmarks = getBookmarksByCategory();
  const categoryKeys = Object.keys(categorizedBookmarks);

  const handleStatisticsPress = () => {
    (navigation as any).navigate("Statistika");
  };

  const handleLessonPress = (lesson: BookmarkedLesson) => {
    (navigation as any).navigate('LessonDetail', {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      mavzu: lesson.mavzu,
      courseType: lesson.courseType,
      courseName: lesson.courseName,
      sectionTitle: lesson.sectionTitle
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
          <Ionicons name="bookmark-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyTitle}>Saqlangan darslar yo'q</Text>
          <Text style={styles.emptySubtitle}>Darslarni saqlash uchun bookmark tugmasini bosing</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleStatisticsPress}>
          <Ionicons name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Save</Text>
        <View style={styles.headerIndicator}>
          <View style={styles.dotIndicator} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {categoryKeys.map((categoryName, index) => {
          const lessons = categorizedBookmarks[categoryName];
          return (
            <View key={categoryName} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{categoryName}</Text>
              
              {lessons.map((lesson, lessonIndex) => (
                <TouchableOpacity
                  key={`${lesson.id}-${lesson.courseType}`}
                  style={styles.lessonItem}
                  onPress={() => handleLessonPress(lesson)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lessonIcon}>
                    <Ionicons name="lock-closed" size={16} color={theme.colors.success} />
                  </View>
                  
                  <View style={styles.lessonContent}>
                    <Text style={styles.lessonTitle}>{lesson.mavzu}</Text>
                    <Text style={styles.lessonSubtitle}>{lesson.title}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveBookmark(lesson)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={16} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    minHeight: 60,
  },
  menuButton: {
    padding: SPACING.xs,
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerIndicator: {
    width: 40,
    alignItems: 'flex-end',
    paddingRight: SPACING.xs,
  },
  dotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: SPACING.base,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.card,
  },
  categorySection: {
    marginTop: SPACING.lg,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: SPACING.base,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.border,
  },
  lessonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.success + '20', // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.base,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  lessonSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});
