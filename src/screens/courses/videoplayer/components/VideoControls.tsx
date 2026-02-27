// VideoControls.tsx
import React from "react";
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity,
  Platform 
} from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import CustomSlider from "./CustomSlider";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

interface VideoControlsProps {
  paused: boolean;
  onPlayPause: () => void;
  handleBack: () => void;
  currentTime: number;
  duration: number;
  fullscreen: boolean;
  onFullscreen: () => void;
  toggleSettings: () => void;
  buffering: boolean;
  title: string;
  onSlidingStart: () => void;
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
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={styles.controlsContainer}>
      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon 
            name="arrow-back" 
            size={moderateScale(24)} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={toggleSettings}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name="settings-outline" 
            size={moderateScale(24)} 
            color="#FFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Center controls */}
      <View style={styles.centerControls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={onPlayPause}
          disabled={buffering}
          activeOpacity={0.7}
        >
          <Icon
            name={paused ? "play-arrow" : "pause"}
            size={moderateScale(48)}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

        <CustomSlider
          value={currentTime}
          maximumValue={duration > 0 ? duration : 1}
          onSlidingStart={onSlidingStart}
          onValueChange={onSliderValueChange}
          onSlidingComplete={onSlidingComplete}
          style={styles.slider}
        />

        <Text style={styles.timeText}>{formatTime(duration)}</Text>

        <TouchableOpacity
          style={styles.fullscreenButton}
          onPress={onFullscreen}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name={fullscreen ? "fullscreen-exit" : "fullscreen"}
            size={moderateScale(24)}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Buffering indicator */}
      {buffering && (
        <View style={styles.bufferingContainer}>
          <View style={styles.bufferingContent}>
            <Icon name="download" size={moderateScale(36)} color="#fff" />
            <Text style={styles.bufferingText}>Yuklanmoqda...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    backgroundColor: Platform.select({
      ios: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)",
      android: "rgba(0,0,0,0.3)"
    }) as any,
    paddingTop: 16,
  },
  topControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  settingsButton: {
    padding: 4,
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: moderateScale(16),
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  centerControls: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: moderateScale(50),
    padding: moderateScale(20),
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: 12,
  },
  timeText: {
    color: "#fff",
    fontSize: moderateScale(12),
    minWidth: 40,
    fontWeight: "500",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
  },
  fullscreenButton: {
    padding: 4,
  },
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  bufferingContent: {
    alignItems: "center",
  },
  bufferingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
});

export default VideoControls;