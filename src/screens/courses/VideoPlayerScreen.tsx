import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  BackHandler,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Video, { DRMType } from "react-native-video";
import { RootStackParamList } from "@/src/types";
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import SystemNavigationBar from "react-native-system-navigation-bar";

const { width, height } = Dimensions.get("window");

export default function VideoPlayerScreen() {
  const lastTap = useRef<number | null>(null);
  const hideControlsTimeout = useRef<any>(null);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const videoRef = useRef<any>(null);
 const leftAnim = useRef(new Animated.Value(0)).current;
const rightAnim = useRef(new Animated.Value(0)).current;

  // Get lesson data from route params
  const { lessonTitle, mavzu, videoFileId } =
    (route.params as RootStackParamList["VideoPlayer"]) || {};

  const animateRipple = (side: "left" | "right") => {
  const anim = side === "left" ? leftAnim : rightAnim;

  // agar oldingi anim davom etsa to'xtatish
  anim.stopAnimation();
  anim.setValue(0);

  Animated.timing(anim, {
    toValue: 1,
    duration: 450,           // xohlagancha o'zgartiring
    useNativeDriver: true,   // opacity va transform uchun ok
  }).start(() => {
    // oxirida qayta 0 ga o'rnatamiz
    anim.setValue(0);
  });
};
  const resetControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (!paused) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // 3s
    }
  };
  // Load authentication token from SecureStore
  useEffect(() => {
    if (showControls) {
      resetControlsTimer();
    } else {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    }
  }, [showControls, !paused]);
  useEffect(() => {
    async function loadAuthToken() {
      try {
        setIsLoading(true);
        const sessionData = await SecureStore.getItemAsync("session");
        if (sessionData) {
          const { token } = JSON.parse(sessionData);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthToken();
  }, []);
  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(console.warn);

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleGoBack();
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
  }, []);
  const handleGoBack = () => {
    navigation.goBack();
  };
  const toggleOrientation = async () => {
    if (isLandscape) {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setIsLandscape(false);
    } else {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
      );
      setIsLandscape(true);
    }
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
  const handleDoubleTap = (side: "left" | "right") => {
    const now = Date.now();

    if (lastTap.current && now - lastTap.current < 300) {
      // 🔹 Double tap bo‘ldi → single tap timeoutni tozalaymiz
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }

      if (side === "left") {
        handlePrevious();
        animateRipple("left");
      } else {
        handleNext();
        animateRipple("right");
      }
      lastTap.current = null;
    } else {
      // 🔹 Single tap → biroz kutib ko‘ramiz, agar 300ms ichida yana bosilmasa, controlsni ko‘rsatamiz
      lastTap.current = now;
      tapTimeout.current = setTimeout(() => {
        setShowControls(true);
        tapTimeout.current = null;
      }, 200);
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
  };

  const onProgress = (data: any) => {
    setBuffered(data.playableDuration);
    setCurrentTime(data.currentTime);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    return () => {
      SystemNavigationBar.navigationShow();
    };
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <TouchableOpacity
        style={styles.videoContainer}
        onPress={toggleControls}
        activeOpacity={1}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        ) : authToken ? (
          <Video
            ref={videoRef}
            source={{
              bufferConfig: {
                minBufferMs: 15000,
                maxBufferMs: 50000,
                bufferForPlaybackMs: 2500,
                bufferForPlaybackAfterRebufferMs: 5000,
              },
              uri: `${Constants.expoConfig?.extra?.API_URL}/videos/${videoFileId}`,
              type: "m3u8",
              drm: {
                type: DRMType.WIDEVINE,
                licenseServer: "",
                headers: {
                  Authorization: "Bearer <dynamic_token_from_server>",
                },
              },
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }}
            style={styles.video}
            paused={paused}
            onLoad={onLoad}
            onExternalPlaybackChange={(data) => {
              console.log(data);
            }}
            onProgress={onProgress}
            fullscreenAutorotate={true}
            fullscreenOrientation="landscape"
            hideShutterView={true}
            playInBackground={true}
            resizeMode="contain"
            onBuffer={({ isBuffering }) => {
              console.log("Buffering: ", isBuffering);
            }}
            repeat={false}
            controls={false}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Unable to load video - Authentication failed
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.tapZones}>
        <TouchableOpacity
          style={styles.leftZone}
          activeOpacity={1}
          onPress={() => handleDoubleTap("left")}
        />
        <TouchableOpacity
          style={styles.rightZone}
          activeOpacity={1}
          onPress={() => handleDoubleTap("right")}
        />
      </View>

      {/* Ripple left */}
     <Animated.View
  pointerEvents="none"
  style={[
    styles.ripple,
    {
      left: 30,
      opacity: leftAnim.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0, 1, 0],   // fade in → visible → fade out
      }),
      transform: [
        {
          scale: leftAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1.9], // kichik -> katta (zoom effect)
          }),
        },
      ],
    },
  ]}
>
  <View style={styles.rippleInner}>
    <Text style={styles.rippleText}>
      <Ionicons name="play-back" size={20} color="white" /> 10
    </Text>
  </View>
</Animated.View>

{/* Ripple right */}
<Animated.View
  pointerEvents="none"
  style={[
    styles.ripple,
    {
      right: 30,
      opacity: rightAnim.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: [0, 1, 0],
      }),
      transform: [
        {
          scale: rightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1.9],
          }),
        },
      ],
    },
  ]}
>
  <View style={styles.rippleInner}>
    <Text style={styles.rippleText}>
      <Ionicons name="play-forward" size={20} color="white" /> 10
    </Text>
  </View>
</Animated.View>

      {/* Controls overlay */}

      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleControls}
        style={{
          position: "absolute",
          width: "100%",
          display: showControls ? "flex" : "none",
          height: "100%",
          justifyContent: "space-between",
          backgroundColor: showControls ? "rgba(0, 0, 0, 0.4)" : "transparent",
        }}
      >
        <View style={styles.topControls}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
        </View>
        {/* Bottom Controls */}
        <View style={styles.bottomSection}>
          {/* Lesson Title */}
          <Text style={styles.lessonTitle}>
            {lessonTitle || "Natural sonlar va ular ustida amallar"}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progress,
                  {
                    width:
                      duration > 0
                        ? `${(currentTime / duration) * 100}%`
                        : "0%",
                  },
                ]}
              />
              <View
                style={[
                  styles.progressBuffered,
                  {
                    width:
                      duration > 0 ? `${(buffered / duration) * 100}%` : "0%",
                  },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Control Buttons */}
          <View
            style={{
              ...styles.controlsContainer,
              ...(isLandscape && { paddingBottom: 6 }),
            }}
          >
            <TouchableOpacity onPress={handleLike} style={styles.controlButton}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={28}
                color={isLiked ? "#ef4444" : "white"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.controlButton}
            >
              <Ionicons name="play-skip-back" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.playButton}
            >
              <Ionicons
                name={paused ? "play" : "pause"}
                size={32}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleOrientation}
              style={styles.controlButton}
            >
              {isLandscape ? (
                <Ionicons name="phone-portrait" size={24} color={"white"} />
              ) : (
                <Ionicons name="phone-landscape" size={24} color={"white"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    width: width,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    fontSize: 16,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    flexDirection: "row",
  },
  leftZone: { flex: 1 },
  rightZone: { flex: 1 },
 ripple: {
  position: "absolute",
  top: "42%",            // vertikal joylashuvni moslashtiring
  width: 120,
  height: 120,
  borderRadius: 60,
  justifyContent: "center",
  alignItems: "center",
  // pointerEvents none uchun Animated.View ga ham qo'yildi
},
rippleInner: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: "rgba(255,255,255,0.12)", // ko‘rinadigan fon
  justifyContent: "center",
  alignItems: "center",
},
rippleText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
},
  topControls: {
    width: "100%",
    paddingVertical: 15,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    position: "relative",
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  teacherSection: {
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
  },
  teacherPlaceholder: {
    alignItems: "center",
  },
  teacherText: {
    fontSize: 60,
    marginBottom: 15,
  },
  lessonIndicator: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  boardText: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 20,
  },
  lessonTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progress: {
    height: "100%",
    zIndex: 2,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  progressBuffered: {
    height: "100%",
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#bbbbbbff",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    color: "white",
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  controlButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
});
