/**
 * VideoPlayerCore – shared YouTube-like player logic + UI.
 *
 * Platform wrappers (Android / iOS) are responsible for:
 *  • GestureHandlerRootView   ← must live here, NOT inside Core
 *  • Screen-capture prevention
 *  • Navigation-bar chrome
 *  • Back-button handling
 */
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
import { Alert, Dimensions, Platform, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Video, { OnProgressData, ViewType } from "react-native-video";
import SettingsDropdown from "./components/SettingsDropdown";
import VideoControls from "./components/VideoControls";
import SeekRipple from "./components/SeekRipple";

// ─── constants ────────────────────────────────────────────────────────────────
const CONTROLS_HIDE_DELAY = 3500;
const MIN_SCALE = 1.0;
const MAX_SCALE = 3.5;

// worklet-safe clamp
function clamp(v: number, lo: number, hi: number): number {
  "worklet";
  return Math.min(hi, Math.max(lo, v));
}

// ─── props ────────────────────────────────────────────────────────────────────
export interface VideoPlayerCoreProps {
  lessonTitle: string;
  videoFileId: string;
  navigation: any;
  onBack: () => void;
}

// ─── component ────────────────────────────────────────────────────────────────
const VideoPlayerCore: React.FC<VideoPlayerCoreProps> = ({
  lessonTitle,
  videoFileId,
  onBack,
}) => {
  // ── React state ────────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState("");
  const [videoHeaders, setVideoHeaders] = useState<Record<string, string>>({});
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);   // drives time labels
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [buffering, setBuffering] = useState(true);
  // Controls pointer-events: "box-none" = interactive, "none" = transparent
  const [controlsPE, setControlsPE] = useState<"box-none" | "none">("box-none");

  // ── Refs (no re-render) ────────────────────────────────────────
  const videoRef = useRef<any>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Slider sliding guard — prevents onProgress from fighting the thumb
  const isSlidingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  // double-tap seek accumulation
  const leftCountRef = useRef(0);
  const rightCountRef = useRef(0);
  const leftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // screen width for double-tap side detection (cached)
  const screenWidthRef = useRef(Dimensions.get("window").width);

  // ── Animated shared values ─────────────────────────────────────
  const controlsOpacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const leftRipple = useSharedValue(0);
  const rightRipple = useSharedValue(0);
  const leftSeekSecs = useSharedValue(10);
  const rightSeekSecs = useSharedValue(10);

  // ── Load video URL ─────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await SecureStore.getItemAsync("session");
        if (!active || !session || !videoFileId) return;
        const { token } = JSON.parse(session);
        setVideoUrl(
          `${Constants.expoConfig?.extra?.API_URL}/api/videos/${videoFileId}`,
        );
        setVideoHeaders({ Authorization: `Bearer ${token}` });
      } catch {
        if (!active) return;
        Alert.alert("Xatolik", "Video yuklanmadi");
      }
    })();
    return () => { active = false; };
  }, [videoFileId]);

  // ── Controls visibility ────────────────────────────────────────
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      controlsOpacity.value = withTiming(0, { duration: 300 }, (done) => {
        if (done) runOnJS(setControlsPE)("none");
      });
    }, CONTROLS_HIDE_DELAY);
  }, [clearHideTimer, controlsOpacity]);

  const showControls = useCallback(
    (autoHide = true) => {
      setControlsPE("box-none");
      clearHideTimer();
      controlsOpacity.value = withTiming(1, { duration: 220 });
      if (autoHide) scheduleHide();
    },
    [clearHideTimer, controlsOpacity, scheduleHide],
  );

  const showControlsForever = useCallback(() => {
    setControlsPE("box-none");
    clearHideTimer();
    controlsOpacity.value = withTiming(1, { duration: 180 });
  }, [clearHideTimer, controlsOpacity]);

  const hideControlsNow = useCallback(() => {
    clearHideTimer();
    controlsOpacity.value = withTiming(0, { duration: 260 }, (done) => {
      if (done) runOnJS(setControlsPE)("none");
    });
  }, [clearHideTimer, controlsOpacity]);

  // Initial show on mount
  useEffect(() => {
    showControls(true);
    return clearHideTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleControls = useCallback(() => {
    if (controlsOpacity.value > 0.5) {
      hideControlsNow();
    } else {
      showControls(true);
    }
  }, [controlsOpacity, hideControlsNow, showControls]);

  // ── Accumulated double-tap seek (YouTube) ──────────────────────
  const commitSeek = useCallback(
    (side: "left" | "right") => {
      const count = side === "left" ? leftCountRef.current : rightCountRef.current;
      const secs = count * 10;
      const newTime =
        side === "left"
          ? Math.max(0, currentTimeRef.current - secs)
          : Math.min(durationRef.current, currentTimeRef.current + secs);

      currentTimeRef.current = newTime;
      setCurrentTime(newTime);
      pendingSeekRef.current = newTime;
      videoRef.current?.seek(newTime);

      if (side === "left") {
        leftCountRef.current = 0;
        leftSeekSecs.value = 10;
        leftTimerRef.current = null;
      } else {
        rightCountRef.current = 0;
        rightSeekSecs.value = 10;
        rightTimerRef.current = null;
      }
    },
    [leftSeekSecs, rightSeekSecs],
  );

  const seekBackward = useCallback(() => {
    if (leftTimerRef.current) clearTimeout(leftTimerRef.current);
    leftCountRef.current += 1;
    leftSeekSecs.value = leftCountRef.current * 10;
    leftRipple.value = 1;
    leftRipple.value = withTiming(0, { duration: 800 });
    leftTimerRef.current = setTimeout(() => commitSeek("left"), 400);
  }, [commitSeek, leftRipple, leftSeekSecs]);

  const seekForward = useCallback(() => {
    if (rightTimerRef.current) clearTimeout(rightTimerRef.current);
    rightCountRef.current += 1;
    rightSeekSecs.value = rightCountRef.current * 10;
    rightRipple.value = 1;
    rightRipple.value = withTiming(0, { duration: 800 });
    rightTimerRef.current = setTimeout(() => commitSeek("right"), 400);
  }, [commitSeek, rightRipple, rightSeekSecs]);

  // ── Video event handlers ───────────────────────────────────────
  const onProgress = useCallback((data: OnProgressData) => {
    // Ignore progress updates while user is scrubbing OR seek is pending
    if (isSlidingRef.current || pendingSeekRef.current !== null) return;
    currentTimeRef.current = data.currentTime;
    setCurrentTime(data.currentTime);
    if ((data as any).playableDuration > 0) {
      setBuffered((data as any).playableDuration);
    }
  }, []);

  const onLoad = useCallback((data: { duration: number }) => {
    durationRef.current = data.duration;
    setDuration(data.duration);
    setBuffering(false);
  }, []);

  const onBuffer = useCallback(
    ({ isBuffering }: { isBuffering: boolean }) => setBuffering(isBuffering),
    [],
  );

  const onLoadStart = useCallback(() => setBuffering(true), []);
  const onReadyForDisplay = useCallback(() => setBuffering(false), []);
  const onSeek = useCallback(() => {
    pendingSeekRef.current = null;
  }, []);

  // ── Slider handlers ────────────────────────────────────────────
  const onSlidingStart = useCallback(() => {
    isSlidingRef.current = true;
    showControlsForever(); // keep controls visible during scrub
  }, [showControlsForever]);

  /**
   * Only update the time labels here (for display).
   * CustomSlider manages its own internal position – do NOT update
   * `sliderValue` here or the native Slider will fight the finger.
   */
  const onSliderValueChange = useCallback((v: number) => {
    currentTimeRef.current = v;
    setCurrentTime(v); // updates time labels only
  }, []);

  const onSlidingComplete = useCallback(
    (v: number) => {
      isSlidingRef.current = false;
      currentTimeRef.current = v;
      setCurrentTime(v);
      pendingSeekRef.current = v;
      videoRef.current?.seek(v);
      if (!paused) scheduleHide();
    },
    [paused, scheduleHide],
  );

  // ── Play / pause ───────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      if (next) showControlsForever(); // paused → keep controls
      else showControls(true);          // playing → auto-hide
      return next;
    });
  }, [showControls, showControlsForever]);

  // ── Fullscreen ─────────────────────────────────────────────────
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

  // ── Settings ───────────────────────────────────────────────────
  const toggleSettings = useCallback(() => {
    setShowSettings((p) => !p);
    showControlsForever();
  }, [showControlsForever]);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
    if (!paused) scheduleHide();
  }, [paused, scheduleHide]);

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      setPlaybackRate(rate);
      closeSettings();
    },
    [closeSettings],
  );

  // ── Animated styles ────────────────────────────────────────────
  const videoZoomStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ scale: scale.value }],
  }));

  const controlsFadeStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // ── Gestures ───────────────────────────────────────────────────
  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(handleToggleControls)();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onStart((e) => {
      const mid = screenWidthRef.current / 2;
      if (e.x < mid) runOnJS(seekBackward)();
      else runOnJS(seekForward)();
    });

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      const snapped = clamp(scale.value, MIN_SCALE, MAX_SCALE);
      scale.value = withSpring(snapped, { damping: 20, stiffness: 130, mass: 0.7 });
      savedScale.value = snapped;
    });

  // Pinch and tap run simultaneously; tap priority: doubleTap > singleTap
  const composed = Gesture.Simultaneous(
    Gesture.Exclusive(doubleTap, singleTap),
    pinch,
  );

  // ── Video source ───────────────────────────────────────────────
  const videoSource = useMemo(
    () => ({
      uri: videoUrl,
      type: "m3u8" as const,
      headers: videoHeaders,
      bufferConfig: {
        minBufferMs: 8000,
        maxBufferMs: 35000,
        bufferForPlaybackMs: 1500,
        bufferForPlaybackAfterRebufferMs: 3000,
      },
    }),
    [videoUrl, videoHeaders],
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <GestureDetector gesture={composed}>
        <View style={styles.touchArea}>

          {/* ── Zoomable video ── */}
          <Animated.View style={videoZoomStyle}>
            <Video
              ref={videoRef}
              source={videoSource}
              style={styles.video}
              paused={paused}
              rate={playbackRate}
              resizeMode="contain"
              // Android renders video into a SurfaceView by default, which IGNORES
              // React Native parent transforms — so pinch-zoom (scale on the parent
              // Animated.View) has no visual effect. TextureView is a normal view
              // that DOES honor transforms, enabling zoom. Window-level FLAG_SECURE
              // (expo-screen-capture in the Android wrapper) still blocks screenshots.
              viewType={Platform.OS === "android" ? ViewType.TEXTURE : undefined}
              onProgress={onProgress}
              onLoad={onLoad}
              onBuffer={onBuffer}
              onLoadStart={onLoadStart}
              onReadyForDisplay={onReadyForDisplay}
              onSeek={onSeek}
              maxBitRate={4000000}
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              progressUpdateInterval={500}
            />
          </Animated.View>

          {/* ── Seek ripples (always mounted, opacity animated) ── */}
          <SeekRipple side="left"  active={leftRipple}  seekSeconds={leftSeekSecs}  />
          <SeekRipple side="right" active={rightRipple} seekSeconds={rightSeekSecs} />

          {/* ── Controls overlay (fade in / out) ── */}
          <Animated.View
            style={[StyleSheet.absoluteFill, controlsFadeStyle]}
            pointerEvents={controlsPE}
          >
            <VideoControls
              paused={paused}
              onPlayPause={togglePlayPause}
              onSeekBackward={seekBackward}
              onSeekForward={seekForward}
              currentTime={currentTime}
              duration={duration}
              buffered={buffered}
              fullscreen={fullscreen}
              onFullscreen={toggleFullscreen}
              toggleSettings={toggleSettings}
              handleBack={onBack}
              buffering={buffering}
              title={lessonTitle}
              onSlidingStart={onSlidingStart}
              onSliderValueChange={onSliderValueChange}
              onSlidingComplete={onSlidingComplete}
            />
          </Animated.View>

        </View>
      </GestureDetector>

      {/* Settings modal rendered outside the gesture area */}
      <SettingsDropdown
        visible={showSettings}
        onClose={closeSettings}
        playbackRate={playbackRate}
        onPlaybackRateChange={handlePlaybackRateChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  touchArea: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
});

export default VideoPlayerCore;
