import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Alert,
  BackHandler,
} from "react-native";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, { runOnJS, useSharedValue } from "react-native-reanimated";
import * as ScreenOrientation from "expo-screen-orientation";
import Icon from "react-native-vector-icons/MaterialIcons";
import SeekRipple from "./components/SeekRipple";
import VideoControls from "./components/VideoControls";
import Video from "react-native-video";
import * as ScreenCapture from "expo-screen-capture";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import SystemNavigationBar from "react-native-system-navigation-bar";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const VideoPlayerScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { lessonTitle, videoFileId } = route.params || {};

  const [videoUrl, setVideoUrl] = useState("");
  const [videoHeaders, setVideoHeaders] = useState({});
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [videoHeight, setVideoHeight] = useState((screenWidth * 9) / 16);

  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Reanimated shared values for ripple
  const leftRipple = useSharedValue(false);
  const rightRipple = useSharedValue(false);

  // Toggle controls (show/hide)
  const toggleControls = useCallback(() => {
    setShowControls((prev) => {
      const next = !prev;
      if (next) {
        if (controlsTimeoutRef.current)
          clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(
          () => setShowControls(false),
          3000
        );
      }
      return next;
    });
  }, []);

  // Hide controls (used inside worklet safely)
  const hideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  // Seek backward
  const seekBackward = useCallback(() => {
    leftRipple.value = true;
    const newTime = Math.max(0, currentTime - 10);
    videoRef.current?.seek(newTime);
    setTimeout(() => {
      leftRipple.value = false;
    }, 600);
  }, [currentTime]);

  // Seek forward
  const seekForward = useCallback(() => {
    rightRipple.value = true;
    const newTime = Math.min(duration, currentTime + 10);
    videoRef.current?.seek(newTime);
    setTimeout(() => {
      rightRipple.value = false;
    }, 600);
  }, [currentTime, duration]);

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
          const url = `${Constants.expoConfig?.extra?.API_URL}/videos/${videoFileId}`;
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

  // Video progress
  const onProgress = useCallback((data: any) => {
    setCurrentTime(data.currentTime);
  }, []);

  const onLoad = useCallback((data: any) => {
    setDuration(data.duration);
  }, []);

  const onBuffer = useCallback(({ isBuffering }: { isBuffering: any }) => {
    setBuffering(isBuffering);
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
      runOnJS(hideControls)(); // ✅ hides controls safely
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

  const videoContainerStyle = {
    width: fullscreen ? screenHeight : screenWidth,
    height: fullscreen ? screenWidth : videoHeight,
  };

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar hidden={fullscreen} />
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={[styles.videoContainer, videoContainerStyle]}>
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
                style={styles.video}
                paused={paused}
                resizeMode="contain"
                onProgress={onProgress}
                onLoad={onLoad}
                onBuffer={onBuffer}
                onLoadStart={() => setBuffering(true)}
                onReadyForDisplay={() => setBuffering(false)}
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
                  duration={duration}
                  fullscreen={fullscreen}
                  handleBack={handleBack}
                  onFullscreen={toggleFullscreen}
                  buffering={buffering}
                  title={lessonTitle}
                  onSliderValueChange={(v: number) => videoRef.current?.seek(v)}
                  onSlidingComplete={(v: number) => videoRef.current?.seek(v)}
                />
              )}
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
});

export default VideoPlayerScreen;
