import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CourseSection, Lesson } from '../../types';
import { CourseService } from '../../services/courseService';
import LessonCard from '../../components/ui/LessonCard';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';

export default function AlgebraScreen() {
  const navigation = useNavigation();
  const algebraData = CourseService.getAlgebraData();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (!lesson.isLocked) {
      // Navigate to lesson detail screen
      (navigation as any).navigate('LessonDetail', {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        mavzu: `${lesson.id}-mavzu`
      });
    }
  };

  const renderSection = (section: CourseSection) => (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.lessons.map(lesson => (
        <LessonCard key={lesson.id} lesson={lesson} onPress={handleLessonPress} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Algebra</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {algebraData.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lockedLessonCard: {
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  lessonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lockIconContainer: {
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  lessonTitle: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 20,
  },
  lockedLessonTitle: {
    color: '#9ca3af',
  },
});
