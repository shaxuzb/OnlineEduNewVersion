import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Lesson } from '../../types';

interface LessonCardProps {
  lesson: Lesson;
  onPress: (lesson: Lesson) => void;
}

export default function LessonCard({ lesson, onPress }: LessonCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.lessonCard,
        lesson.isLocked && styles.lockedLessonCard
      ]}
      onPress={() => onPress(lesson)}
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
}

const styles = StyleSheet.create({
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
