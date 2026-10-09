/**
 * Android video player wrapper.
 * Handles:
 *  - Immersive mode (system bars hidden while the player is open)
 *  - Screen-capture prevention (expo-screen-capture)
 *  - Hardware back-button
 *  - Portrait lock on unmount
 *
 * All player logic lives in VideoPlayerCore.
 */
import * as ScreenCapture from "expo-screen-capture";
import * as ScreenOrientation from "expo-screen-orientation";
import React, { useCallback, useEffect } from "react";
import { BackHandler, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SystemBars } from "react-native-edge-to-edge";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import VideoPlayerCore from "./VideoPlayerCore";

type Props = NativeStackScreenProps<RootStackParamList, "VideoPlayer">;

const VideoPlayerScreen = ({ navigation, route }: Props) => {
  const { lessonTitle, videoFileId } = route.params;

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
      {/*
        Hides both bars through the edge-to-edge controller. React Native's own
        StatusBar re-enables `decorFitsSystemWindows` when it shows the bar
        again, which drops the whole app out of edge-to-edge and breaks every
        header until restart.
      */}
      <SystemBars hidden />
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
