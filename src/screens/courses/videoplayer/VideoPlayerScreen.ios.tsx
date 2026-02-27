// VideoPlayerScreen.tsx
import Constants from "expo-constants";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SecureStore from "expo-secure-store";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Dimensions, StatusBar, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Video, { OnProgressData } from "react-native-video";
import { SafeAreaView } from "react-native-safe-area-context";

import SeekRipple from "./components/SeekRipple";
import VideoControls from "./components/VideoControls";
import { SettingsDropdown } from "./components/SettingsDropdown";
import { useFocusEffect } from "@react-navigation/native";

const { width: screenWidth } = Dimensions.get("window");

const VideoPlayerScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { lessonTitle, videoFileId } = route.params;

  // useSGScreenRecord hook'ini ishlatamiz lekin polling qo'shamiz

  // Video player state'lari
  const [videoUrl, setVideoUrl] = useState("");
  const [videoHeaders, setVideoHeaders] = useState<Record<string, string>>({});
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [buffering, setBuffering] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [pendingSeekTime, setPendingSeekTime] = useState<number | null>(null);

  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const leftRipple = useSharedValue(0);
  const rightRipple = useSharedValue(0);

  useEffect(() => {
    if (showControls && !isSliding) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    };
  }, [showControls, isSliding]);

  useEffect(() => {
    if (pendingSeekTime !== null && videoRef.current) {
      videoRef.current.seek(pendingSeekTime);
      setPendingSeekTime(null);
    }
  }, [pendingSeekTime]);

  const toggleControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    setShowControls((prev) => !prev);
  }, []);

  const hideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  const seekBackward = useCallback(() => {
    leftRipple.value = 1;

    leftRipple.value = withTiming(0, { duration: 600 });

    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    setPendingSeekTime(newTime);
  }, [currentTime]);

  const seekForward = useCallback(() => {
    rightRipple.value = 1;

    rightRipple.value = withTiming(0, { duration: 600 });

    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);
    setPendingSeekTime(newTime);
  }, [currentTime, duration]);

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev);
    setShowControls(true);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (fullscreen) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
      setFullscreen(false);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
      );
      setFullscreen(true);
    }
  }, [fullscreen]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
  }, []);

  const handleBack = useCallback(async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    );
    navigation.goBack();
  }, [navigation]);

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

  /* ---------------------------------------------------
     Video event handlers
  --------------------------------------------------- */
  const onProgress = useCallback(
    (data: OnProgressData) => {
      if (!isSliding && pendingSeekTime === null) {
        setCurrentTime(data.currentTime);
      }
    },
    [isSliding, pendingSeekTime],
  );

  const onLoad = useCallback((data: { duration: number }) => {
    setDuration(data.duration);
    // Video yuklangandan keyin ScreenGuard ni ishga tushirish
  }, []);

  const onBuffer = useCallback(({ isBuffering }: { isBuffering: boolean }) => {
    setBuffering(isBuffering);
  }, []);

  const onSeek = useCallback(() => {
    setPendingSeekTime(null);
  }, []);

  /* ---------------------------------------------------
     Slider handlers
  --------------------------------------------------- */
  const onSlidingStart = useCallback(() => {
    setIsSliding(true);
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  const onSliderValueChange = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  const onSlidingComplete = useCallback((value: number) => {
    setCurrentTime(value);
    setPendingSeekTime(value);
    setIsSliding(false);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  /* ---------------------------------------------------
     Gestures
  --------------------------------------------------- */
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(toggleControls)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((event) => {
      runOnJS(hideControls)();
      const x = event.x;
      const screenMiddle = screenWidth / 2;
      if (x < screenMiddle) {
        runOnJS(seekBackward)();
      } else {
        runOnJS(seekForward)();
      }
    });

  const tapGesture = Gesture.Exclusive(doubleTap, singleTap);

  /* ---------------------------------------------------
     Video source memoization
  --------------------------------------------------- */
  const videoSource = useMemo(
    () => ({
      uri: videoUrl,
      type: "m3u8" as const,
      headers: videoHeaders,
    }),
    [videoUrl, videoHeaders],
  );
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Screen UNMOUNT bo‘layotganda ishlaydi
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      };
    }, []),
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <GestureHandlerRootView style={styles.container}>
        <StatusBar
          hidden={fullscreen}
          backgroundColor="#000"
          barStyle="light-content"
        />
        <GestureDetector gesture={tapGesture}>
          <Animated.View style={styles.videoContainer}>
            {/* Video Player */}
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
              resizeMode={fullscreen ? "cover" : "contain"}
              onProgress={onProgress}
              onLoad={onLoad}
              onBuffer={onBuffer}
              playInBackground={false}
              onLoadStart={() => setBuffering(true)}
              onReadyForDisplay={() => setBuffering(false)}
              onSeek={onSeek}
              maxBitRate={2000000}
              ignoreSilentSwitch="ignore"
              disableFocus={false}
              enterPictureInPictureOnLeave={false}
              allowsExternalPlayback={false}
              preventsDisplaySleepDuringVideoPlayback={true}
            />

            {/* Seek Ripples */}
            <SeekRipple side="left" active={leftRipple} text="-10s" />
            <SeekRipple side="right" active={rightRipple} text="+10s" />

            {/* Video Controls */}
            {showControls && (
              <VideoControls
                paused={paused}
                onPlayPause={() => setPaused((p) => !p)}
                currentTime={currentTime}
                toggleSettings={toggleSettings}
                duration={duration}
                fullscreen={fullscreen}
                handleBack={handleBack}
                onFullscreen={toggleFullscreen}
                buffering={buffering}
                title={lessonTitle?.toString?.() ?? ""}
                onSlidingStart={onSlidingStart}
                onSliderValueChange={onSliderValueChange}
                onSlidingComplete={onSlidingComplete}
              />
            )}

            {/* Settings Dropdown */}
            <SettingsDropdown
              visible={showSettings}
              onClose={() => setShowSettings(false)}
              playbackRate={playbackRate}
              onPlaybackRateChange={handlePlaybackRateChange}
            />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  video: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default VideoPlayerScreen;
