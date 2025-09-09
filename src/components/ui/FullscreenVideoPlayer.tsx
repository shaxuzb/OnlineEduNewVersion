import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  StatusBar,
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Video from 'react-native-video';

interface FullscreenVideoPlayerProps {
  visible: boolean;
  onClose: () => void;
  videoUri: string;
  title: string;
  onLike?: () => void;
  isLiked?: boolean;
}

const { width, height } = Dimensions.get('window');

export default function FullscreenVideoPlayer({
  visible,
  onClose,
  videoUri,
  title,
  onLike,
  isLiked = false
}: FullscreenVideoPlayerProps) {
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<Video>(null);

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

  const handleMinimize = () => {
    onClose();
  };

  const handleLike = () => {
    if (onLike) {
      onLike();
    }
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

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      supportedOrientations={['portrait', 'landscape']}
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* Back Button */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
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
          />
          
          {/* Video Overlay with Teacher */}
          <View style={styles.videoOverlay}>
            <View style={styles.teacherSection}>
              {/* This would be replaced with actual video content */}
              <View style={styles.teacherPlaceholder}>
                <Text style={styles.teacherText}>👨‍🏫</Text>
                <Text style={styles.lessonIndicator}>1. Mavzu</Text>
                <Text style={styles.boardText}>Natural sonlar haqida</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Lesson Title */}
          <Text style={styles.lessonTitle}>{title}</Text>
          
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

              <TouchableOpacity onPress={handleMinimize} style={styles.controlButton}>
                <Ionicons name="remove" size={28} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  topControls: {
    position: 'absolute',
    top: 40,
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
  },
  teacherSection: {
    width: width * 0.8,
    height: height * 0.5,
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
    fontSize: 80,
    marginBottom: 20,
  },
  lessonIndicator: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boardText: {
    fontSize: 16,
    color: '#e5e7eb',
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  lessonTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
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
