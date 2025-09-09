import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
  uri: string;
  title?: string;
}

const { width } = Dimensions.get('window');

export default function VideoPlayer({ uri, title }: VideoPlayerProps) {
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<Video>(null);

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      
      <TouchableOpacity
        style={[styles.videoContainer, { height: width * 0.56 }]}
        onPress={() => setShowControls(!showControls)}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          paused={paused}
          onLoad={onLoad}
          onProgress={onProgress}
          resizeMode="contain"
          repeat={false}
        />
        
        {showControls && (
          <View style={styles.controls}>
            <TouchableOpacity 
              onPress={handlePlayPause} 
              style={styles.playButton}
            >
              <Ionicons
                name={paused ? 'play' : 'pause'}
                size={50}
                color="white"
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      
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
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  videoContainer: {
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 16,
  },
  progressContainer: {
    padding: 16,
    paddingTop: 8,
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
  timeText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});
