import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface Lesson {
  id: number;
  title: string;
  isLocked: boolean;
  isCompleted: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

const geometriyaData: Section[] = [
  {
    id: '1-bob',
    title: '1-bob. Nuqta va to\'g\'ri chiziq',
    lessons: [
      {
        id: 1,
        title: 'Geometriya asoslari',
        isLocked: false,
        isCompleted: false
      },
      {
        id: 2,
        title: 'Nuqta va to\'g\'ri chiziq xossalari',
        isLocked: true,
        isCompleted: false
      },
      {
        id: 3,
        title: 'Chiziq va nur tushunchalari',
        isLocked: true,
        isCompleted: false
      }
    ]
  },
  {
    id: '2-bob',
    title: '2-bob. Burchaklar',
    lessons: [
      {
        id: 4,
        title: 'Burchak tushunchasi va turlari',
        isLocked: true,
        isCompleted: false
      },
      {
        id: 5,
        title: 'Burchaklarni o\'lchash',
        isLocked: true,
        isCompleted: false
      }
    ]
  }
];

export default function GeometriyaScreen() {
  const navigation = useNavigation();

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

  const renderLesson = (lesson: Lesson) => (
    <TouchableOpacity
      key={lesson.id}
      style={[
        styles.lessonCard,
        lesson.isLocked && styles.lockedLessonCard
      ]}
      onPress={() => handleLessonPress(lesson)}
      disabled={lesson.isLocked}
    >
      <View style={styles.lessonContent}>
        <View style={styles.lessonLeft}>
          <View style={styles.lockIconContainer}>
            <Ionicons 
              name={lesson.isLocked ? "lock-closed" : "lock-open"} 
              size={16} 
              color={lesson.isLocked ? "#9ca3af" : "#10b981"} 
            />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonNumber}>{lesson.id}-mavzu:</Text>
            <Text style={[
              styles.lessonTitle,
              lesson.isLocked && styles.lockedLessonTitle
            ]}>
              {lesson.title}
            </Text>
          </View>
        </View>
        {!lesson.isLocked && (
          <Ionicons name="hand-left" size={20} color="#fbbf24" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: Section) => (
    <View key={section.id} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.lessons.map(renderLesson)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geometriya</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="person" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {geometriyaData.map(renderSection)}
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
