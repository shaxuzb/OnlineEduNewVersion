/**
 * Android video player wrapper.
 * Handles:
 *  - Immersive / sticky navigation bar (hide system UI)
 *  - Screen-capture prevention (expo-screen-capture)
 *  - Hardware back-button
 *  - Portrait lock on unmount
 *
 * All player logic lives in VideoPlayerCore.
 */
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect } from "react";
import { BackHandler, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import VideoPlayerCore from "./VideoPlayerCore";

type Props = NativeStackScreenProps<RootStackParamList, "VideoPlayer">;

const VideoPlayerScreen = ({ navigation, route }: Props) => {
  const { lessonTitle, videoFileId } = route.params;

  useEffect(() => {
    SystemNavigationBar.stickyImmersive();
    return () => {
      SystemNavigationBar.navigationShow();
    };
  }, []);

  useEffect(() => {
    ScreenCapture.preventScreenCaptureAsync().catch(console.warn);
    return () => {
      ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
    };
  }, []);

  const handleBack = useCallback(async () => {
    await ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(console.warn);
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      void handleBack();
      return true;
    });
    return () => {
      sub.remove();
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(console.warn);
    };
  }, [handleBack]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar hidden backgroundColor="#000" />
      <VideoPlayerCore
        lessonTitle={lessonTitle}
        videoFileId={videoFileId}
        onBack={handleBack}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
});

export default VideoPlayerScreen;
