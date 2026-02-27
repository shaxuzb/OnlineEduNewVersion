import React, { useEffect, useState } from "react";
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
import LessonDetailScreen from "../screens/courses/LessonDetailScreen";
import QuizScreen from "../screens/courses/QuizScreen";
import QuizResultsScreen from "../screens/courses/QuizResultsScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import { useAuth } from "../context/AuthContext";

import SystemNavigationBar from "react-native-system-navigation-bar";
import StatistikaSubjectScreen from "../screens/statistics/details/StatistikaSubjectScreen";
import StatistikaTestScreen from "../screens/statistics/details/StatistikaTestScreen";
import { StatusBar, StyleSheet } from "react-native";
import PaymentOrders from "../screens/profile/screen/paymentorders";
import SolutionScreen from "../screens/courses/SolutionScreen";
import VideoPlayerScreen from "../screens/courses/videoplayer";
import LinearGradient from "react-native-linear-gradient";
import ThemeAbstractScreen from "../screens/courses/ThemeAbstractScreen";
import { moderateScale } from "react-native-size-matters";
import DeviceInfo from "react-native-device-info";
import NoConnection from "../components/NoConnection";

import NetInfo from "@react-native-community/netinfo";
import { PurchaseStack } from "./PurchaseStack";
import { PurchaseModal } from "../screens/purchases/components/PurchaseModal";
import { PurchaseProvider } from "../context/PurchaseContext";
import MainTabNavigator from "./maintab";
import QuizScreenSertificate from "../screens/courses/sertificatetests/QuizScreenSertificate";
import QuizResultsScreenSertificate from "../screens/courses/sertificatetests/QuizResultsScreenSertificate";
import SolutionScreenSertificate from "../screens/courses/sertificatetests/SolutionScreenSertificate";

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
      component={ChatScreen}
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
      component={StatistikaSubjectScreen}
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
      component={StatistikaTestScreen}
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
      component={LessonDetailScreen}
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
      component={VideoPlayerScreen}
      options={{ headerShown: false, freezeOnBlur: true }}
    />
    <Stack.Screen
      name="ThemeAbstract"
      component={ThemeAbstractScreen}
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
      component={QuizScreenSertificate}
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
      component={QuizScreen}
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
      component={QuizResultsScreen}
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
      component={QuizResultsScreenSertificate}
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
      name="QuizSolution"
      component={SolutionScreen}
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
      component={SolutionScreenSertificate}
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
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected);
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
      <ThemeProvider
        value={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: theme.colors.background,
          },
        }}
      >
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
