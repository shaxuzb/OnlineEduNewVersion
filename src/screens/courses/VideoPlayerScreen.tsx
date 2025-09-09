import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<Video>(null);

  // Get lesson data from route params
  const { lessonTitle, mavzu } = (route.params as any) || {};

  // HLS test video URL
  const videoUri = 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8';

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const handlePrevious = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.max(0, currentTime - 10));
    }
  };

  const handleNext = () => {
    if (videoRef.current) {
      videoRef.current.seek(Math.min(duration, currentTime + 10));
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Back Button */}
      <View style={styles.topControls}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="white" />
          <View style={styles.handPointer}>
            <Ionicons name="hand-left" size={20} color="#fbbf24" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          paused={paused}
          onLoad={onLoad}
          onProgress={onProgress}
          resizeMode="contain"
          repeat={false}
          controls={false}
        />
        
        {/* Teacher Overlay - Demo content */}
        <View style={styles.videoOverlay}>
          <View style={styles.teacherSection}>
            <View style={styles.teacherPlaceholder}>
              <Text style={styles.teacherText}>👨‍🏫</Text>
              <Text style={styles.lessonIndicator}>{mavzu || '1. Mavzu'}</Text>
              <Text style={styles.boardText}>Natural sonlar haqida</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Bottom Controls */}
      <View style={styles.bottomSection}>
        {/* Lesson Title */}
        <Text style={styles.lessonTitle}>
          {lessonTitle || 'Natural sonlar va ular ustida amallar'}
        </Text>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }
              ]}
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Control Buttons */}
        {showControls && (
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={handleLike} style={styles.controlButton}>
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={28} 
                color={isLiked ? "#ef4444" : "white"} 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePrevious} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              <Ionicons 
                name={paused ? "play" : "pause"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleGoBack} style={styles.controlButton}>
              <Ionicons name="remove" size={28} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  handPointer: {
    position: 'absolute',
    top: -5,
    right: -15,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: width,
    height: height * 0.6,
  },
  videoOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  teacherSection: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  teacherPlaceholder: {
    alignItems: 'center',
  },
  teacherText: {
    fontSize: 60,
    marginBottom: 15,
  },
  lessonIndicator: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  boardText: {
    fontSize: 14,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  lessonTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  controlButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});
