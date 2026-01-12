import Constants from "expo-constants";
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SecureStore from "expo-secure-store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  StatusBar,
  StyleSheet,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import SystemNavigationBar from "react-native-system-navigation-bar";
import Video from "react-native-video";
import SeekRipple from "./components/SeekRipple";
import VideoControls from "./components/VideoControls";
import { SettingsDropdown } from "./components/SettingsDropdown";
import { moderateScale } from "react-native-size-matters";

const { width: screenWidth } = Dimensions.get("window");

const VideoPlayerScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { lessonTitle, videoFileId } = route.params;

  const [videoUrl, setVideoUrl] = useState("");
  const [videoHeaders, setVideoHeaders] = useState({});
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [buffering, setBuffering] = useState(false);
  const [isSliding, setIsSliding] = useState(false); // ✅ Slider holati
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null); // ✅ Pending seek

  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);
  const seekTimeoutRef = useRef<any>(null);

  // Reanimated shared values for ripple
  const leftRipple = useSharedValue(false);
  const rightRipple = useSharedValue(false);

  // ✅ Kontrollerlarni avtomatik yashirish
  useEffect(() => {
    if (showControls && !isSliding) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        2000
      );
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, [showControls, isSliding]);

  // ✅ Pending seek time o'zgarganida video seek qilish
  useEffect(() => {
    if (pendingSeekTime !== null) {
      videoRef.current?.seek(pendingSeekTime);
      setPendingSeekTime(null);
    }
  }, [pendingSeekTime]);

  // Toggle controls (show/hide)
  const toggleControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls((prev) => !prev);
  }, []);

  // Hide controls (used inside worklet safely)
  const hideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  // ✅ Seek backward - faqat time ni o'zgartirish
  const seekBackward = useCallback(() => {
    leftRipple.value = true;
    const newTime = Math.max(0, currentTime - 10);

    // Faqat currentTime ni yangilash, video seek keyinroq
    setCurrentTime(newTime);
    setPendingSeekTime(newTime);

    // Ripple effektini 600ms dan keyin olib tashlash
    seekTimeoutRef.current = setTimeout(() => {
      leftRipple.value = false;
    }, 600);
  }, [currentTime]);
  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      setPlaybackRate(rate);
      // Video componentiga playback rate ni o'rnatish
      // if (videoRef.current) {
      //   videoRef.current.seek(currentTime); // O'zgartirishni amalga oshirish
      // }
    },
    [currentTime]
  );
  // ✅ Seek forward - faqat time ni o'zgartirish
  const seekForward = useCallback(() => {
    rightRipple.value = true;
    const newTime = Math.min(duration, currentTime + 10);

    // Faqat currentTime ni yangilash, video seek keyinroq
    setCurrentTime(newTime);
    setPendingSeekTime(newTime);

    // Ripple effektini 600ms dan keyin olib tashlash
    seekTimeoutRef.current = setTimeout(() => {
      rightRipple.value = false;
    }, 600);
  }, [currentTime, duration]);
  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
    setShowControls(true);
  }, []);
  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
      setFullscreen(true);
    }
  }, [fullscreen]);

  // Load video
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sessionData = await SecureStore.getItemAsync("session");
        if (!mounted) return;

        if (sessionData && videoFileId) {
          const { token } = JSON.parse(sessionData);
          const url = `${Constants.expoConfig?.extra?.API_URL}/api/videos/${videoFileId}`;
          setVideoUrl(url);
          setVideoHeaders({ Authorization: `Bearer ${token}` });
        } else {
          setBuffering(false);
        }
      } catch (e) {
        if (!mounted) return;
        Alert.alert("Error", "Failed to load video");
        setBuffering(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [videoFileId]);

  const handleBack = useCallback(async () => {
    await ScreenCapture.allowScreenCaptureAsync();
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    return () => {
      SystemNavigationBar.navigationShow();
    };
  }, []);

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
    };
  }, [handleBack]);
  // ✅ Video progress - faqat sliding bo'lmaganda yangilash
  const onProgress = useCallback(
    (data: any) => {
      if (!isSliding && pendingSeekTime === null) {
        setCurrentTime(data.currentTime);
      }
    },
    [isSliding, pendingSeekTime]
  );

  const onLoad = useCallback((data: any) => {
    setDuration(data.duration);
  }, []);

  const onBuffer = useCallback(({ isBuffering }: { isBuffering: any }) => {
    setBuffering(isBuffering);
  }, []);

  // ✅ Seek tugaganda
  const onSeek = useCallback(() => {
    setPendingSeekTime(null);
  }, []);

  // ✅ Slider boshlanganda
  const onSlidingStart = useCallback(() => {
    setIsSliding(true);
    setShowControls(true); // ✅ Slider boshlanganda kontrollerlarni ko'rsatish

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  // ✅ Slider qiymati o'zgarganda
  const onSliderValueChange = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  // ✅ Slider tugaganda
  const onSlidingComplete = useCallback((value: number) => {
    setCurrentTime(value);
    setPendingSeekTime(value);
    setIsSliding(false);

    // ✅ 2 sekunddan keyin kontrollerlarni yashirish
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  // Gesture definitions
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      "worklet";
      runOnJS(toggleControls)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      "worklet";
      runOnJS(hideControls)();
      const x = event.x;
      const screenMiddle = screenWidth / 2;
      if (x < screenMiddle) {
        runOnJS(seekBackward)();
      } else {
        runOnJS(seekForward)();
      }
    });

  // Combine gestures (double tap has priority)
  const tapGesture = Gesture.Exclusive(doubleTap, singleTap);

  const videoSource = useMemo(
    () => ({
      uri: videoUrl,
      type: "m3u8" as const,
      headers: videoHeaders,
    }),
    [videoUrl, videoHeaders]
  );

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden={fullscreen} />
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={[styles.videoContainer]}>
            <Animated.View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{
                  ...videoSource,
                  bufferConfig: {
                    minBufferMs: 15000,
                    maxBufferMs: 50000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000,
                  },
                }}
                rate={playbackRate}
                style={styles.video}
                paused={paused}
                resizeMode="contain"
                onProgress={onProgress}
                onLoad={onLoad}
                onBuffer={onBuffer}
                playInBackground={false}
                onLoadStart={() => setBuffering(true)}
                onReadyForDisplay={() => setBuffering(false)}
                // fullscreenOrientation="portrait"
                // fullscreenAutorotate
                // fullscreen={true}
                // controls
                onSeek={onSeek}
                maxBitRate={2000000}
              />

              {/* Ripple animations */}
              <SeekRipple side="left" active={leftRipple} text="-10s" />
              <SeekRipple side="right" active={rightRipple} text="+10s" />

              {/* Controls */}
              {showControls && (
                <VideoControls
                  paused={paused}
                  onPlayPause={() => setPaused(!paused)}
                  currentTime={currentTime}
                  toggleSettings={toggleSettings}
                  duration={duration}
                  fullscreen={fullscreen}
                  handleBack={handleBack}
                  onFullscreen={toggleFullscreen}
                  buffering={buffering}
                  title={lessonTitle.toString()}
                  onSlidingStart={onSlidingStart}
                  onSliderValueChange={onSliderValueChange}
                  onSlidingComplete={onSlidingComplete}
                />
              )}
              <SettingsDropdown
                styles={styles}
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                playbackRate={playbackRate}
                onPlaybackRateChange={handlePlaybackRateChange}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  videoWrapper: { flex: 1 },
  video: { flex: 1 },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    paddingTop: 70,
  },
  dropdownContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  dropdownTitle: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  playbackRatesContainer: {
    gap: 8,
  },
  playbackRateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(6),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  playbackRateButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  playbackRateText: {
    color: "#FFF",
    fontSize: moderateScale(14),
    fontWeight: "500",
  },
  playbackRateTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default VideoPlayerScreen;
