import React, { useEffect, useMemo, useState } from "react";
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";

import NewsScreen from "../screens/news/NewsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

import SystemNavigationBar from "react-native-system-navigation-bar";
import { StatusBar } from "react-native";
import PaymentOrders from "../screens/profile/screen/paymentorders";
import LinearGradient from "react-native-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import DeviceInfo from "react-native-device-info";
import NoConnection from "../components/NoConnection";

import NetInfo from "@react-native-community/netinfo";
import { PurchaseStack } from "./PurchaseStack";
import { PurchaseModal } from "../screens/purchases/components/PurchaseModal";
import { PurchaseProvider } from "../context/PurchaseContext";
import MainTabNavigator from "./maintab";

const Stack = createNativeStackNavigator();
const isTablet = DeviceInfo.isTablet();

const MainStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      animation: "ios_from_right",
      freezeOnBlur: true,
      headerShown: true,
      headerTintColor: "white",
      headerTitleAlign: "center",
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={MainTabNavigator}
      options={{
        headerShown: false,
        freezeOnBlur: true,
        headerBackTitle: "Orqaga",
      }}
    />
    <Stack.Screen
      name="Chat"
      getComponent={() => require("../screens/chat/ChatScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackButtonDisplayMode: "minimal",
        headerShown: true,
        freezeOnBlur: true,
        headerTintColor: "white",
        headerTitleAlign: "center",
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
      }}
      // options={{ animation: "ios_from_left" }}
    />
    <Stack.Screen
      name="News"
      component={NewsScreen}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackTitle: "Orqaga",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
      // options={{ animation: "ios_from_left" }}
    />
    <Stack.Screen
      name="StatistikaDetail"
      getComponent={() =>
        require("../screens/statistics/details/StatistikaSubjectScreen")
          .default
      }
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="StatistikaDetailTest"
      getComponent={() =>
        require("../screens/statistics/details/StatistikaTestScreen").default
      }
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="LessonDetail"
      getComponent={() => require("../screens/courses/LessonDetailScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="VideoPlayer"
      getComponent={() => require("../screens/courses/videoplayer").default}
      options={{ headerShown: false, freezeOnBlur: true }}
    />
    <Stack.Screen
      name="ThemeAbstract"
      getComponent={() => require("../screens/courses/ThemeAbstractScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizScreenSertificate"
      getComponent={() =>
        require("../screens/courses/sertificatetests/QuizScreenSertificate")
          .default
      }
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        headerTitleAlign: "center",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizScreen"
      getComponent={() => require("../screens/courses/QuizScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        headerTitleAlign: "center",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizResults"
      getComponent={() => require("../screens/courses/QuizResultsScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizResultsSertificate"
      getComponent={() =>
        require("../screens/courses/sertificatetests/QuizResultsScreenSertificate")
          .default
      }
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        headerBackButtonDisplayMode: "minimal",
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizResultsHistorySertificate"
      getComponent={() =>
        require(
          "../screens/courses/sertificatetests/QuizResultsHistoryScreenSertificate"
        ).default
      }
      options={{
        presentation: "transparentModal",
        animation: "slide_from_bottom",
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="QuizSolution"
      getComponent={() => require("../screens/courses/SolutionScreen").default}
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackButtonDisplayMode: "minimal",
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="QuizSolutionSertificate"
      getComponent={() =>
        require("../screens/courses/sertificatetests/SolutionScreenSertificate")
          .default
      }
      options={{
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackButtonDisplayMode: "minimal",
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        title: "Profil",
        animation: "ios_from_left",
        headerShown: true,
        headerTintColor: "white",
        headerBackButtonDisplayMode: "minimal",
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
    <Stack.Screen
      name="PersonalInfo"
      component={PersonalInfoScreen}
      options={{
        title: "Shaxsiy ma'lumotlar",
        headerShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />

    <Stack.Screen
      name="PurchaseGroup"
      component={PurchaseStack}
      options={{
        animation: "ios_from_right",
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="PaymentOrders"
      component={PaymentOrders}
      options={{
        title: "Mening to‘lovlarim",
        headerBackButtonDisplayMode: "minimal",
        headerStyle: {
          backgroundColor: isTablet ? "#3a5dde" : undefined,
        },
        headerBackground() {
          return (
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{ flex: 1 }}
            />
          );
        },
        freezeOnBlur: true,
        headerTitleStyle: {
          fontSize: +moderateScale(18).toFixed(0),
        },
      }}
    />
  </Stack.Navigator>
);

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.background,
      },
    }),
    [theme.colors.background],
  );
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const next = !!state.isConnected;
      setIsConnected((prev) => (prev === next ? prev : next));
    });

    return () => unsubscribe();
  }, []);
  // Show loading screen (splash screen) while checking authentication
  useEffect(() => {
    try {
      SystemNavigationBar.setBarMode(theme.isDark ? "light" : "dark");
      SystemNavigationBar.setNavigationColor(theme.colors.tabBarBackground);
    } catch (error) {
      console.warn("SystemNavigationBar error:", error);
    }
  }, [theme]);
  if (!isConnected) {
    return <NoConnection setIsConnected={setIsConnected} />;
  }
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <ThemeProvider value={navigationTheme}>
        <StatusBar
          hidden
          translucent
          backgroundColor={"transparent"}
          barStyle={"light-content"}
        />
        <PurchaseProvider>
          {isAuthenticated ? <MainStackNavigator /> : <LoginScreen />}
          <PurchaseModal />
        </PurchaseProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}
