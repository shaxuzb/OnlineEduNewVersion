import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { useTheme } from "../context/ThemeContext";

/** Keeps status and Android navigation bars in sync with the app theme. */
const ThemeStatusBar: React.FC = () => {
  const { theme } = useTheme();
  const barStyle = theme.isDark ? "light-content" : "dark-content";
  const systemBarMode = theme.isDark ? "light" : "dark";

  useEffect(() => {
    StatusBar.setHidden(false, "none");
  }, []);

  useEffect(() => {
    StatusBar.setBarStyle(barStyle, true);

    if (Platform.OS !== "android") {
      return;
    }

    void SystemNavigationBar.setBarMode(systemBarMode, "navigation").catch(
      () => undefined,
    );
    void SystemNavigationBar.setNavigationColor(
      theme.colors.tabBarBackground,
      systemBarMode,
      "navigation",
    ).catch(() => undefined);
  }, [barStyle, systemBarMode, theme.colors.tabBarBackground]);

  // Keep this controller imperative-only. Rendering a persistent native
  // StatusBar view alongside screen-level StatusBar instances can trigger
  // Fabric's "Attempt to recycle a mounted view" crash on iOS.
  return null;
};

export default ThemeStatusBar;
