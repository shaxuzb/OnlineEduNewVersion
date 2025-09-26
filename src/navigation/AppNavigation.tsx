import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

import { CoursesStackNavigator } from "./CoursesStackNavigator";
import NewsScreen from "../screens/news/NewsScreen";
import SaveScreen from "../screens/save/SaveScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import LoadingScreen from "../components/LoadingScreen";
import StatistikaScreen from "../screens/courses/StatistikaScreen";
import LessonDetailScreen from "../screens/courses/LessonDetailScreen";
import VideoPlayerScreen from "../screens/courses/VideoPlayerScreen";
import PDFViewerScreen from "../screens/courses/PDFViewerScreen";
import QuizScreen from "../screens/courses/QuizScreen";
import QuizResultsScreen from "../screens/courses/QuizResultsScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import { useAuth } from "../context/AuthContext";

import SystemNavigationBar from "react-native-system-navigation-bar";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === "Courses") {
            iconName = focused ? "library" : "library-outline";
          } else if (route.name === "News") {
            iconName = focused ? "newspaper" : "newspaper-outline";
          } else if (route.name === "Save") {
            iconName = focused ? "bookmark" : "bookmark-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{ tabBarLabel: "Courses" }}
      />
      <Tab.Screen
        name="News"
        component={NewsScreen}
        options={{ tabBarLabel: "News" }}
      />
      <Tab.Screen
        name="Save"
        component={SaveScreen}
        options={{ tabBarLabel: "Save" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profil" }}
      />
    </Tab.Navigator>
  );
};

const MainStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      animation: "ios_from_right",
    }}
  >
    <Stack.Screen
      name="MainTabs"
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Statistika"
      component={StatistikaScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="LessonDetail"
      component={LessonDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="VideoPlayer"
      component={VideoPlayerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PDFViewer"
      component={PDFViewerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QuizScreen"
      component={QuizScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="QuizResults"
      component={QuizResultsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PersonalInfo"
      component={PersonalInfoScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  // Show loading screen (splash screen) while checking authentication
  useEffect(() => {
    SystemNavigationBar.setBarMode(theme.isDark ? "light" : "dark");
    SystemNavigationBar.setNavigationColor(theme.colors.tabBarBackground);
    
  }, [theme]);
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      {isAuthenticated ? <MainStackNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}
