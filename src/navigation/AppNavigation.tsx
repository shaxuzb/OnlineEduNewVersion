import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "../context/ThemeContext";

import NewsScreen from "../screens/news/NewsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";

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
import RegisterScreen from "../screens/auth/RegisterScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import { AuthStackParamList } from "../types";
import { isNetworkUsable } from "../services/networkState";
import { RootStackParamList } from "./rootTypes";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const isTablet = DeviceInfo.isTablet();

const mockFlowScreenOptions = {
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
  headerBackButtonDisplayMode: "minimal" as const,
  headerTitleAlign: "center" as const,
  freezeOnBlur: true,
  headerTitleStyle: {
    fontSize: +moderateScale(18).toFixed(0),
  },
};

const AuthStackNavigator = React.memo(() => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: "slide_from_right",
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </AuthStack.Navigator>
));

const MainStackNavigator = React.memo(() => (
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
    />
    <Stack.Screen
      name="StatistikaDetail"
      getComponent={() =>
        require("../screens/statistics/details/StatistikaSubjectScreen").default
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
      getComponent={() =>
        require("../screens/courses/LessonDetailScreen").default
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
      name="VideoPlayer"
      getComponent={() => require("../screens/courses/videoplayer").default}
      options={{ headerShown: false, freezeOnBlur: true }}
    />
    <Stack.Screen
      name="ThemeAbstract"
      getComponent={() =>
        require("../screens/courses/ThemeAbstractScreen").default
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
      getComponent={() =>
        require("../screens/courses/QuizResultsScreen").default
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
      name="MockQuizScreen"
      getComponent={() => require("../screens/courses/MockQuizScreen").default}
      options={{ ...mockFlowScreenOptions, title: "Mock test" }}
    />
    <Stack.Screen
      name="MockQuizResults"
      getComponent={() =>
        require("../screens/courses/MockQuizResultsScreen").default
      }
      options={{ ...mockFlowScreenOptions, title: "Natijalar" }}
    />
    <Stack.Screen
      name="MockQuizSolution"
      getComponent={() =>
        require("../screens/courses/MockSolutionScreen").default
      }
      options={{ ...mockFlowScreenOptions, title: "Yechimlar" }}
    />
    <Stack.Screen
      name="MockQuizResultsHistory"
      getComponent={() =>
        require("../screens/courses/MockQuizResultsHistoryScreen").default
      }
      options={{ ...mockFlowScreenOptions, title: "Natijalar tarixi" }}
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
        require("../screens/courses/sertificatetests/QuizResultsHistoryScreenSertificate")
          .default
      }
      options={{
        animation: "slide_from_right",
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
));

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [isOnline, setIsOnline] = useState(true);

  const navigationTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: theme.isDark,
      colors: {
        ...DefaultTheme.colors,
        background: theme.colors.background,
      },
    }),
    [theme.colors.background, theme.isDark],
  );

  const applyNetworkState = useCallback(
    (state: {
      isConnected: boolean | null;
      isInternetReachable: boolean | null;
    }) => {
      const next = isNetworkUsable(state);
      setIsOnline((previous) => (previous === next ? previous : next));
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(applyNetworkState);
    void NetInfo.fetch().then(applyNetworkState);
    return () => unsubscribe();
  }, [applyNetworkState]);

  const handleRetry = useCallback(async () => {
    applyNetworkState(await NetInfo.fetch());
  }, [applyNetworkState]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer theme={navigationTheme}>
        <PurchaseProvider>
          {isAuthenticated ? <MainStackNavigator /> : <AuthStackNavigator />}
          <PurchaseModal />
        </PurchaseProvider>
      </NavigationContainer>
      {!isOnline && <NoConnection onRetry={handleRetry} />}
    </View>
  );
}
