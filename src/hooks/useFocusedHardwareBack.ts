import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Handles the Android hardware back button while the screen is focused.
 *
 * A plain `useEffect` subscription stays alive for as long as the screen is
 * mounted, so it keeps swallowing back presses for every screen pushed on top
 * of it. Tying the subscription to focus hands the button back to the
 * navigator as soon as another screen takes over.
 */
export const useFocusedHardwareBack = (onBackPress: () => void) => {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          onBackPress();
          return true;
        },
      );

      return () => subscription.remove();
    }, [onBackPress]),
  );
};

export default useFocusedHardwareBack;
