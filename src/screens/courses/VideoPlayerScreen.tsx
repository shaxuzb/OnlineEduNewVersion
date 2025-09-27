import React, { useRef, useEffect, useState } from "react";
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
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Video, { VideoRef } from "react-native-video";
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import { Slider } from "@rneui/base";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { RootStackParamList } from "@/src/types";

const VideoPlayerScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const videoRef = useRef<VideoRef>(null);
  const lastTap = useRef<number | null>(null);
  const hideControlsTimeout = useRef<any>(null);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoHeaders, setVideoHeaders] = useState<any>({});
  const [error, setError] = useState<string>("");
  const { lessonTitle, mavzu, videoFileId } =
    (route.params as RootStackParamList["VideoPlayer"]) || {};

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);

  // animation refs
  const leftAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;

  const animateRipple = (side: "left" | "right") => {
    const anim = side === "left" ? leftAnim : rightAnim;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      anim.setValue(0); // tugaganda yo‘qoladi
    });
  };
  const resetControlsTimer = () => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // 3s
    }
  };
  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    return () => {
      SystemNavigationBar.navigationShow();
    };
  }, [isLandscape]);
  useEffect(() => {
    if (isLoading) {
      setShowControls(true);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [isLoading]);
  useEffect(() => {
    if (showControls) {
      resetControlsTimer();
    } else {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    }
  }, [showControls, isPlaying]);
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
  }, []);

  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const sessionData = await SecureStore.getItemAsync("session");
        if (sessionData && videoFileId) {
          const { token } = JSON.parse(sessionData);
          const url = `${Constants.expoConfig?.extra?.API_URL}/videos/${videoFileId}`;
          setVideoUrl(url);
          setVideoHeaders({ Authorization: `Bearer ${token}` });
        }
      } catch {
        setError("Failed to load video");
        Alert.alert("Error", "Failed to load video");
      }
    };
    loadVideoUrl();
  }, [videoFileId]);

  const handleBack = async () => {
    await ScreenCapture.allowScreenCaptureAsync();
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP
    );
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

  const handleVideoLoad = (data: any) => {
    setDuration(data?.duration);
    setIsLoading(false);
  };

  const handleVideoProgress = (data: any) => {
    setCurrentTime(data.currentTime);
    setBufferedTime(data.playableDuration);
  };

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    setShowControls(true);
  };

  const handleSeek = (seconds: number) => {
    let newTime = currentTime + seconds;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    setCurrentTime(newTime);
    videoRef.current?.seek(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // DOUBLE TAP HANDLER
  const handleDoubleTap = (side: "left" | "right") => {
    const now = Date.now();

    if (lastTap.current && now - lastTap.current < 300) {
      // 🔹 Double tap bo‘ldi → single tap timeoutni tozalaymiz
      if (tapTimeout.current) {
        clearTimeout(tapTimeout.current);
        tapTimeout.current = null;
      }

      if (side === "left") {
        handleSeek(-10);
        animateRipple("left");
      } else {
        handleSeek(10);
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
  
  return (
    <SafeAreaView
      edges={["bottom", "left", "right", "top"]}
      style={styles.container}
    >
      <StatusBar hidden />
      <TouchableOpacity
        style={{
          flex: 1,
        }}
        activeOpacity={1}
        onPress={() => {
          setShowControls(!showControls);
        }}
      >
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl, type: "m3u8", headers: videoHeaders }}
            onError={() => {
              setError("Video playback failed");
              setIsLoading(false);
            }}
            style={styles.video}
            onLoad={handleVideoLoad}
            onProgress={handleVideoProgress}
            paused={!isPlaying}
            resizeMode="contain"
          />
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                style={{ transform: [{ scale: 2.5 }], zIndex: 10 }}
                color="#FFF"
              />
            </View>
          )}

          {/* Double tap zones */}
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
            style={[
              styles.ripple,
              {
                left: 30,
                opacity: leftAnim,
                transform: [
                  {
                    scale: leftAnim.interpolate({
                      inputRange: [1, 1],
                      outputRange: [1, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.rippleText}>
              <Ionicons name="play-back" size={24} /> 10
            </Text>
          </Animated.View>

          {/* Ripple right */}
          <Animated.View
            style={[
              styles.ripple,
              {
                right: 30,
                opacity: rightAnim,
                transform: [
                  {
                    scale: rightAnim.interpolate({
                      inputRange: [1, 1],
                      outputRange: [1, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.rippleText}>
              <Ionicons name="play-forward" size={24} /> 10
            </Text>
          </Animated.View>

          {/* Controls overlay */}

          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              display: showControls ? "flex" : "none",
              backgroundColor: showControls
                ? "rgba(0, 0, 0, 0.4)"
                : "transparent",
            }}
          >
            {/* TOP BAR */}
            <View style={styles.topControls}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.controlText}>
                  <Ionicons name="arrow-back" size={24} />
                </Text>
              </TouchableOpacity>
              <Text style={styles.videoTitle}>{lessonTitle}</Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={toggleOrientation}
              >
                <Text style={styles.controlText}>
                  {isLandscape ? (
                    <Ionicons name="phone-portrait" size={24} />
                  ) : (
                    <Ionicons name="phone-landscape" size={24} />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* CENTER PLAY/PAUSE */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                <Text style={styles.playButtonText}>
                  {isPlaying ? (
                    <FontAwesome6 name="pause" size={80} />
                  ) : (
                    <FontAwesome6 name="play" size={80} />
                  )}
                </Text>
              </TouchableOpacity>
            </View>

            {/* BOTTOM BAR */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View
                style={styles.container}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
              >
                {/* Orqa fon */}
                <View style={styles.backgroundBar} />

                {/* Buffer progress (kulrang/oqish) */}
                <View
                  style={[
                    styles.bufferBar,
                    { width: `${((bufferedTime) / duration) * 100}%` },
                  ]}
                />

                {/* Played progress (qizil/oq) */}
                <View
                  style={[
                    styles.playedBar,
                    { width: `${(currentTime / duration) * 100}%` },
                  ]}
                />

                {/* Bosganda seek qilish */}

                {/* Slider thumb (faqat boshqarish uchun) */}
                <Slider
                  minimumValue={0}
                  maximumValue={Math.floor(duration)}
                  value={isSeeking ? Math.floor(seekTime) : Math.floor(currentTime)}
                  onValueChange={(v) => {
                    setIsSeeking(true);
                    setSeekTime(v);
                  }}
                  onSlidingComplete={(v) => {
                    setIsSeeking(false);
                    videoRef.current?.seek(v);
                  }}
                  minimumTrackTintColor="transparent" // chizig‘ini yashiramiz
                  maximumTrackTintColor="transparent" // faqat thumb ko‘rinadi
                  thumbTintColor="#FFF"
                  thumbStyle={{ width: 15, height: 15 }}
                  style={{ ...StyleSheet.absoluteFillObject, height: 4 }}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  videoContainer: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: { width: "100%", height: "100%" },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
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
    pointerEvents: "none",
    padding: 16,
    borderRadius: 50,
  },
  rippleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    justifyContent: "center",
    alignItems: "center",
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
  controlText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  videoTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  centerControls: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0)",
    width: 80,
    height: 80,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: { fontWeight: "bold", color: "#ffffffff" },
  bottomControls: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    bottom: 0,
    height: 70,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  backgroundBar: {
    position: "absolute",
    height: 4,
    width: "100%",
    backgroundColor: "#444", // orqa fon
    borderRadius: 2,
  },
  bufferBar: {
    position: "absolute",
    height: 4,
    backgroundColor: "#888", // buffer rang
    borderRadius: 2,
  },
  playedBar: {
    position: "absolute",
    height: 4,
    backgroundColor: "white", // o‘ynalgan joy
    borderRadius: 2,
  },
  timeText: {
    color: "#FFF",
    fontSize: 12,
    width: 45,
    textAlign: "center",
  },
});

export default VideoPlayerScreen;
