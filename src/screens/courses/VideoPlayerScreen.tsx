import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Animated,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import Video, { VideoRef } from "react-native-video";
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const HIDE_CONTROLS_MS = 3000;
const DOUBLE_TAP_MS = 300;
const PROGRESS_THROTTLE_MS = 500;
const SEEK_AMOUNT = 10;

// Alohida Ripple komponenti
const Ripple: React.FC<{
  side: "left" | "right";
  isVisible: boolean;
  anim: Animated.Value;
}> = ({ side, isVisible, anim }) => {
  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.ripple,
        {
          [side]: 30,
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1.4],
              }),
            },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.rippleText}>
        <Ionicons
          name={side === "left" ? "play-back" : "play-forward"}
          size={24}
        />
        {SEEK_AMOUNT}
      </Text>
    </Animated.View>
  );
};

const VideoPlayerScreen: React.FC<{ route: any; navigation: any }> = React.memo(
  ({ route, navigation }) => {
    const videoRef = useRef<VideoRef | null>(null);
    const { lessonTitle, videoFileId } = route.params || {};

    // Refs
    const lastTap = useRef<number | null>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const singleTapTimeout = useRef<NodeJS.Timeout | null>(null);
    const lastProgressUpdate = useRef<number>(0);

    // Animations
    const leftAnim = useRef(new Animated.Value(0)).current;
    const rightAnim = useRef(new Animated.Value(0)).current;

    // State
    const [videoUrl, setVideoUrl] = useState("");
    const [videoHeaders, setVideoHeaders] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isLandscape, setIsLandscape] = useState(false);
    const [leftRippleVisible, setLeftRippleVisible] = useState(false);
    const [rightRippleVisible, setRightRippleVisible] = useState(false);
    const sliderValue = useRef(currentTime); // local ref
    const [isSeeking, setIsSeeking] = useState(false);
    // Memoized values
    const videoSource = useMemo(
      () => ({
        uri: videoUrl,
        type: "m3u8" as const,
        headers: videoHeaders,
      }),
      [videoUrl, videoHeaders]
    );

    const formatTime = useCallback((seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }, []);

    // Animation functions
    const animateRipple = useCallback(
      (side: "left" | "right") => {
        const anim = side === "left" ? leftAnim : rightAnim;
        const setVisible =
          side === "left" ? setLeftRippleVisible : setRightRippleVisible;

        setVisible(true);
        anim.setValue(0);

        Animated.timing(anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false);
        });
      },
      [leftAnim, rightAnim]
    );
    const handleSlidingStart = useCallback(() => {
      setIsSeeking(true);
    }, []);
    const handleSlidingComplete = useCallback((value: number) => {
      videoRef.current?.seek(value);
      setCurrentTime(value);
      sliderValue.current = value;
      setIsSeeking(false);
    }, []);
    // Controls management
    const resetControlsTimer = useCallback(() => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }

      if (isPlaying && showControls) {
        hideControlsTimeout.current = setTimeout(() => {
          setShowControls(false);
        }, HIDE_CONTROLS_MS);
      }
    }, [isPlaying, showControls]);

    const handleShowControls = useCallback(() => {
      setShowControls((prev) => !prev);
    }, []);

    // Video controls
    const handlePlayPause = useCallback(() => {
      setIsPlaying((prev) => !prev);
      setShowControls(true);
    }, []);

    const handleSeek = useCallback(
      (seconds: number) => {
        const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
        setCurrentTime(newTime);
        videoRef.current?.seek(newTime);
      },
      [currentTime, duration]
    );

    // Double tap handler
    const handleDoubleTap = useCallback(
      (side: "left" | "right") => {
        const now = Date.now();
        const isDoubleTap =
          lastTap.current && now - lastTap.current < DOUBLE_TAP_MS;

        if (isDoubleTap) {
          if (singleTapTimeout.current) {
            clearTimeout(singleTapTimeout.current);
          }
          handleSeek(side === "left" ? -SEEK_AMOUNT : SEEK_AMOUNT);
          animateRipple(side);
          lastTap.current = null;
        } else {
          lastTap.current = now;
          singleTapTimeout.current = setTimeout(() => {
            setShowControls(true);
          }, DOUBLE_TAP_MS);
        }
      },
      [handleSeek, animateRipple]
    );

    // Video event handlers
    const handleVideoLoad = useCallback((data: any) => {
      setDuration(data?.duration ?? 0);
      setIsLoading(false);
    }, []);

    const handleVideoProgress = useCallback(
      (data: any) => {
        const now = Date.now();
        if (!isSeeking && now - lastProgressUpdate.current >= 1000) {
          // har 1 sek
          lastProgressUpdate.current = now;
          setCurrentTime(data.currentTime ?? 0);
        }
      },
      [isSeeking]
    );

    const onBuffer = useCallback((data: any) => {
      setIsLoading(data.isBuffering);
    }, []);

    // Orientation
    const toggleOrientation = useCallback(async () => {
      const newOrientation = !isLandscape;
      await ScreenOrientation.lockAsync(
        newOrientation
          ? ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
          : ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setIsLandscape(newOrientation);
    }, [isLandscape]);

    // Navigation
    const handleBack = useCallback(async () => {
      await ScreenCapture.allowScreenCaptureAsync();
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      navigation.goBack();
    }, [navigation]);

    // Effects
    useEffect(() => {
      resetControlsTimer();
      return () => {
        if (hideControlsTimeout.current) {
          clearTimeout(hideControlsTimeout.current);
        }
      };
    }, [showControls, resetControlsTimer]);

    useEffect(() => {
      ScreenCapture.preventScreenCaptureAsync().catch(console.warn);
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBack();
          return true;
        }
      );
      return () => {
        ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        backHandler.remove();
        leftAnim.stopAnimation();
        rightAnim.stopAnimation();

        // Cleanup timeouts
        if (hideControlsTimeout.current) {
          clearTimeout(hideControlsTimeout.current);
        }
        if (singleTapTimeout.current) {
          clearTimeout(singleTapTimeout.current);
        }
      };
    }, [handleBack]);

    useEffect(() => {
      let mounted = true;

      (async () => {
        try {
          const sessionData = await SecureStore.getItemAsync("session");
          if (!mounted) return;

          if (sessionData && videoFileId) {
            const { token } = JSON.parse(sessionData);
            const url = `${Constants.expoConfig?.extra?.API_URL}/videos/${videoFileId}`;
            setVideoUrl(url);
            setVideoHeaders({ Authorization: `Bearer ${token}` });
          } else {
            setIsLoading(false);
          }
        } catch (e) {
          if (!mounted) return;
          Alert.alert("Error", "Failed to load video");
          setIsLoading(false);
        }
      })();

      return () => {
        mounted = false;
      };
    }, [videoFileId]);

    // Optimized subcomponents - useCallback bilan
    const TopBar = useCallback(
      () => (
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.videoTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={toggleOrientation}
          >
            <Ionicons
              name={isLandscape ? "phone-portrait" : "phone-landscape"}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      ),
      [handleBack, lessonTitle, toggleOrientation, isLandscape]
    );

    const CenterPlay = useCallback(
      () => (
        <View style={styles.centerControls}>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <FontAwesome6
              name={isPlaying ? "pause" : "play"}
              size={80}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>
      ),
      [handlePlayPause, isPlaying]
    );

    const BottomBar = useCallback(
      () => (
        <View style={styles.bottomControls}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

          <View style={styles.sliderContainer}>
            <Slider
              value={isSeeking ? sliderValue.current : currentTime}
              maximumValue={Math.max(duration, 1)}
              onValueChange={(value) => {
                sliderValue.current = value;
              }}
              onSlidingStart={handleSlidingStart}
              onSlidingComplete={handleSlidingComplete}
              thumbTintColor="#FFF"
              minimumTrackTintColor="#FFF"
              maximumTrackTintColor="#888"
            />
          </View>

          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      ),
      [currentTime, duration, formatTime]
    );

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <TouchableOpacity
          style={styles.flex1}
          activeOpacity={1}
          onPress={handleShowControls}
        >
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={videoSource}
              style={styles.video}
              onLoad={handleVideoLoad}
              onProgress={handleVideoProgress}
              onBuffer={onBuffer}
              onError={() => {
                Alert.alert("Error", "Video playback failed");
                setIsLoading(false);
              }}
              paused={!isPlaying}
              resizeMode="contain"
              controls={true}
            />

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFF" />
              </View>
            )}

            <View style={styles.tapZones}>
              <TouchableOpacity
                style={styles.tapZone}
                activeOpacity={1}
                onPress={() => handleDoubleTap("left")}
              />
              <TouchableOpacity
                style={styles.tapZone}
                activeOpacity={1}
                onPress={() => handleDoubleTap("right")}
              />
            </View>

            <Ripple side="left" isVisible={leftRippleVisible} anim={leftAnim} />
            <Ripple
              side="right"
              isVisible={rightRippleVisible}
              anim={rightAnim}
            />

            {showControls && (
              <View style={[StyleSheet.absoluteFill, styles.controlsOverlay]}>
                <TopBar />
                <CenterPlay />
                <BottomBar />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  flex1: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  tapZone: {
    flex: 1,
  },
  ripple: {
    position: "absolute",
    top: "50%",
    marginTop: -30,
    padding: 16,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  rippleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  controlsOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    height: 70,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 40,
    height: 40,
    justifyContent: "center",
    borderRadius: 20,
    alignItems: "center",
  },
  videoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  centerControls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    padding: 20,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    minWidth: 45,
    textAlign: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
  },
});

export default VideoPlayerScreen;
