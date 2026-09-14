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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ScreenGuardModule from "react-native-screenguard";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import VideoPlayerCore from "./VideoPlayerCore";

type Props = NativeStackScreenProps<RootStackParamList, "VideoPlayer">;

const VideoPlayerScreen = ({ navigation, route }: Props) => {
  const { lessonTitle, videoFileId } = route.params;

  const guardActiveRef = useRef(false);
  const guardReqRef = useRef(0);

  const setGuard = useCallback((enabled: boolean) => {
    if (guardActiveRef.current === enabled) return;
    guardActiveRef.current = enabled;
    const reqId = ++guardReqRef.current;

    void (async () => {
      try {
        if (enabled) {
          try {
            await ScreenGuardModule.unregister();
          } catch {}
          await ScreenGuardModule.initSettings({
            displayScreenGuardOverlay: false,
            timeAfterResume: 500,
            getScreenshotPath: false,
          });
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

  const handleBack = useCallback(() => {
    setGuard(false);
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(console.warn);
    navigation.goBack();
  }, [navigation, setGuard]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden translucent backgroundColor="transparent" />
      <VideoPlayerCore
        lessonTitle={lessonTitle}
        videoFileId={videoFileId}
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
