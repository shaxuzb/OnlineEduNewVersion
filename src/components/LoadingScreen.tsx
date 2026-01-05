import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import Logo from "@/src/assets/icons/logo/logo.svg";
import { moderateScale } from "react-native-size-matters";
import LinearGradient from "react-native-linear-gradient";
const { width } = Dimensions.get("window");
const LoadingScreen: React.FC = () => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Hide the native splash screen after a short delay
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <LinearGradient
      colors={["#3a5dde", "#5e84e6"]}
      start={{ x: 0.5, y: 1.0 }}
      end={{ x: 0.5, y: 0.0 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Logo width={width} />
      </Animated.View>

      <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        <Text style={styles.loadingText}>Tekshirilmoqda...</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 80,
  },
  logoText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -2,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 32,
    fontWeight: "300",
    color: "#ffffff",
    marginTop: -12,
    fontStyle: "italic",
    opacity: 0.9,
  },
  loadingContainer: {
    alignItems: "center",
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: moderateScale(18),
    color: "#ffffff",
    fontWeight: "500",
    opacity: 0.8,
  },
});

export default LoadingScreen;
