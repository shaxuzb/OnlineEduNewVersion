import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils';

const { width } = Dimensions.get('window');

export default function LessonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Get lesson data from route params
  const { lessonId, lessonTitle, mavzu } = (route.params as any) || {};
  
  const lessonData = {
    id: lessonId || 1,
    title: lessonTitle || 'Natural sonlar va ular ustida amallar',
    mavzu: mavzu || '1-mavzu',
    videoUrl: 'https://sample-video-url.com',
    duration: '15:30'
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handlePlayVideo = () => {
    // Navigate to video player screen
    (navigation as any).navigate('VideoPlayer', {
      lessonTitle: lessonData.title,
      mavzu: lessonData.mavzu
    });
  };

  const handleMashqlar = () => {
    console.log('Open exercises');
    // Navigate to exercises screen
  };

  const handleOralQuestions = () => {
    console.log('Open oral questions');
    // Navigate to oral questions screen
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{lessonData.mavzu}</Text>
        
        <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
          <Ionicons 
            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Lesson Title */}
        <Text style={styles.lessonTitle}>{lessonData.title}</Text>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <TouchableOpacity 
            style={styles.videoPlayer}
            onPress={handlePlayVideo}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="white" />
              </View>
              <View style={styles.handPointer}>
                <Ionicons name="hand-left" size={24} color="#fbbf24" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleMashqlar}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Mashqlar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleOralQuestions}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="play-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionButtonText}>Og'zaki savol-javob</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
  },
  headerButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  lessonTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
    lineHeight: 28,
  },
  videoContainer: {
    marginBottom: SPACING['2xl'],
  },
  videoPlayer: {
    width: '100%',
    height: width * 0.56, // 16:9 aspect ratio
    backgroundColor: '#000',
    borderRadius: BORDER_RADIUS.base,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handPointer: {
    position: 'absolute',
    top: -10,
    right: -30,
  },
  actionButtons: {
    gap: SPACING.base,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    marginRight: SPACING.base,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: '500',
  },
});
