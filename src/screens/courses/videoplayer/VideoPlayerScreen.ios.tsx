/**
 * iOS video player wrapper.
 *
 * Responsibilities:
 *  • GestureHandlerRootView  (single root for the whole player tree)
 *  • ScreenGuard – blur on screenshot / screen-record (race-condition safe)
 *  • Orientation lock on unmount
 *  • StatusBar fully hidden for immersive playback
 *
 * Safe-area insets are applied INSIDE VideoControls via useSafeAreaInsets()
 * so the controls respect the notch / home-indicator without adding black bars.
 */
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useRef } from "react";
import { StatusBar, StyleSheet } from "react-native";
import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import ScreenGuardModule from "react-native-screenguard";
import { useFocusEffect } from "@react-navigation/native";
import VideoPlayerCore from "./VideoPlayerCore";

const VideoPlayerScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { lessonTitle, videoFileId } = route.params;

  // ── ScreenGuard (race-condition-safe) ──────────────────────────
  const guardActiveRef = useRef(false);
  const guardReqRef = useRef(0);

  const setGuard = useCallback((enabled: boolean) => {
    if (guardActiveRef.current === enabled) return;
    guardActiveRef.current = enabled;
    const reqId = ++guardReqRef.current;

    (async () => {
      try {
        if (enabled) {
          try { await ScreenGuardModule.unregister(); } catch { /* ignore */ }
          await ScreenGuardModule.initSettings({
            displayScreenGuardOverlay: false,
            timeAfterResume: 500,
            getScreenshotPath: false,
          });
          // Bail out if a newer request came in
          if (guardReqRef.current !== reqId || !guardActiveRef.current) return;
          await ScreenGuardModule.registerWithBlurView({ radius: 20 });
        } else {
          await ScreenGuardModule.unregister();
        }
      } catch (err) {
        console.warn("ScreenGuard iOS:", err);
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setGuard(true);
      return () => {
        setGuard(false);
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ).catch(console.warn);
      };
    }, [setGuard]),
  );

  // ── Back navigation ────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setGuard(false);
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(console.warn);
    navigation.goBack();
  }, [navigation, setGuard]);

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Fully hidden – VideoControls pads for the notch internally */}
      <StatusBar hidden translucent backgroundColor="transparent" />
      <VideoPlayerCore
        lessonTitle={String(lessonTitle ?? "")}
        videoFileId={String(videoFileId ?? "")}
        navigation={navigation}
        onBack={handleBack}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
});

export default VideoPlayerScreen;
