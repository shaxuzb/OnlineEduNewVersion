import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import CustomSlider from "./CustomSlider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
interface VideoControlsProps {
  paused: boolean;
  onPlayPause: () => void;
  handleBack: () => void;
  currentTime: number;
  duration: number;
  fullscreen: boolean;
  onFullscreen: () => void;
  toggleSettings:() => void;
  buffering: boolean;
  title: string;
  onSlidingStart: any;
  onSliderValueChange: (value: number) => void;
  onSlidingComplete: (value: number) => void;
}
const VideoControls: React.FC<VideoControlsProps> = ({
  paused,
  onPlayPause,
  handleBack,
  currentTime,
  duration,
  fullscreen,
  onFullscreen,
  buffering,
  onSlidingStart,
  toggleSettings,
  title,
  onSliderValueChange,
  onSlidingComplete,
}) => {
  const formatTime = (seconds: any) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <SafeAreaView style={styles.controlsContainer}>
      <View style={styles.controlsContainer}>
        {/* Top controls */}
        <View style={styles.topControls}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <TouchableOpacity
            style={[styles.backButton, styles.settingsButton]}
            onPress={toggleSettings}
          >
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Center controls */}
        <View style={styles.centerControls}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={onPlayPause}
            disabled={buffering}
          >
            <Icon
              name={paused ? "play-arrow" : "pause"}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

          <CustomSlider
            value={currentTime}
            maximumValue={duration || 1}
            onSlidingStart={onSlidingStart}
            onValueChange={onSliderValueChange}
            onSlidingComplete={onSlidingComplete}
            style={styles.slider}
          />

          <Text style={styles.timeText}>{formatTime(duration)}</Text>

          <TouchableOpacity
            style={styles.fullscreenButton}
            onPress={onFullscreen}
          >
            <Icon
              name={fullscreen ? "fullscreen-exit" : "fullscreen"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Buffering indicator */}
        {buffering && (
          <View style={styles.bufferingContainer}>
            <Icon name="download" size={30} color="#fff" />
            <Text style={styles.bufferingText}>Yuklanmoqda...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:"space-between",
    gap: 10,
    padding: 16,
  },
  topBackButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButton: {
    marginRight: 8,
  },
  topRightButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 50,
    padding: 20,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 30,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    minWidth: 40,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  fullscreenButton: {
    padding: 5,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  bufferingText: {
    color: "#fff",
    marginTop: 10,
  },
});

export default VideoControls;
