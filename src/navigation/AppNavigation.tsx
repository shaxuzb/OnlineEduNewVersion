import React, { useEffect } from "react";
import {
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

import { CoursesStackNavigator } from "./CoursesStackNavigator";
import NewsScreen from "../screens/news/NewsScreen";
import SaveScreen from "../screens/save/SaveScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PersonalInfoScreen from "../screens/profile/PersonalInfoScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import LoadingScreen from "../components/LoadingScreen";
import StatistikaScreen from "../screens/statistics/StatistikaScreen";
import LessonDetailScreen from "../screens/courses/LessonDetailScreen";
import QuizScreen from "../screens/courses/QuizScreen";
import QuizResultsScreen from "../screens/courses/QuizResultsScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import { useAuth } from "../context/AuthContext";

import SystemNavigationBar from "react-native-system-navigation-bar";
import StatistikaSubjectScreen from "../screens/statistics/details/StatistikaSubjectScreen";
import StatistikaTestScreen from "../screens/statistics/details/StatistikaTestScreen";
import { StatusBar, TouchableOpacity, View } from "react-native";
import PaymentOrders from "../screens/profile/screen/paymentorders";
import SolutionScreen from "../screens/courses/SolutionScreen";
import VideoPlayerScreen from "../screens/courses/videoplayer";
import LinearGradient from "react-native-linear-gradient";
import { PurchaseProvider } from "../context/PurchaseContext";
import PurchaseSubjectScreen from "../screens/purchases/PurchaseSubjectScreen";
import CheckoutScreen from "../screens/purchases/CheckoutScreen";
import CreditCardScreen from "../screens/purchases/CreditCardScreen";
import OTPCardVerification from "../screens/purchases/OTPCardVerification";
import PurchaseSubjectThemeScreen from "../screens/purchases/PurchaseSubjectThemeScreen";
import EmptyScreen from "../screens/empty";
import ThemeAbstractScreen from "../screens/courses/ThemeAbstractScreen";
import { useSession } from "../hooks/useSession";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();
  const { isSuperAdmin } = useSession();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          if (route.name === "Courses") {
            iconName = "grid";
          } else if (route.name === "Statistika") {
            iconName = "pie-chart";
          } else if (route.name === "Save") {
            iconName = "bookmark";
          } else if (route.name === "ChatTab") {
            iconName = "chatbubble-ellipses-sharp";
          }

          return <Ionicons name={iconName} size={size + 5} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopColor: "red",
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderTopLeftRadius: 20,
          borderTopEndRadius: 20,
          zIndex: 10,
          paddingTop: 0,
          borderTopWidth: 1,
        },
        tabBarButton: (props) => {
          const filteredProps = Object.fromEntries(
            Object.entries(props).filter(([, value]) => value !== null)
          );
          return <TouchableOpacity activeOpacity={1} {...filteredProps} />;
        },
        tabBarVariant: "uikit",
        headerShown: false,
        lazy: true,
      })}
    >
      <Tab.Screen
        name="Courses"
        component={CoursesStackNavigator}
        options={{ tabBarLabel: "Kurslar" }}
      />
      <Tab.Screen
        name="Statistika"
        component={StatistikaScreen}
        options={{ tabBarLabel: "Statistika" }}
      />
      {!isSuperAdmin && (
        <Tab.Screen
          name="Payment"
          component={EmptyScreen}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("PurchaseGroup", {
                screen: "PurchaseSubject",
              });
            },
          })}
          options={{
            tabBarLabel: "Sotib olish",
            tabBarIcon: () => (
              <LinearGradient
                colors={["#3a5dde", "#5e84e6"]}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 150,
                  justifyContent: "center",
                  alignItems: "center",
                  bottom: 18,
                }}
              >
                <FontAwesome5 name="plus" size={34} color="white" />
              </LinearGradient>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Save"
        component={SaveScreen}
        options={{
          tabBarLabel: "Saqlanganlar",
          headerTitle: "Saqlanganlar",
          headerShown: true,
          headerTitleAlign: "center",
          headerTintColor: "white",
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
      <Tab.Screen
        name="ChatTab"
        component={EmptyScreen}
        options={{
          tabBarLabel: "Chat",
        freezeOnBlur:true,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Chat");
          },
        })}
      />
    </Tab.Navigator>
  );
};

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
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{
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
      }}
      // options={{ animation: "ios_from_left" }}
    />
    <Stack.Screen
      name="StatistikaDetail"
      component={StatistikaSubjectScreen}
      options={{
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
      }}
    />
    <Stack.Screen
      name="StatistikaDetailTest"
      component={StatistikaTestScreen}
      options={{
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
      }}
    />
    <Stack.Screen
      name="LessonDetail"
      component={LessonDetailScreen}
      options={{
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
        freezeOnBlur:true,
      }}
    />
    <Stack.Screen
      name="QuizScreen"
      component={QuizScreen}
      options={{
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
        freezeOnBlur:true,
      }}
    />
    <Stack.Screen
      name="QuizResults"
      component={QuizResultsScreen}
      options={{
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
        freezeOnBlur:true,
      }}
    />
    <Stack.Screen
      name="QuizSolution"
      component={SolutionScreen}
      options={{
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
        freezeOnBlur:true,
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
        freezeOnBlur:true,
        headerTitleAlign: "center",
      }}
    />
    <Stack.Screen
      name="PersonalInfo"
      component={PersonalInfoScreen}
      options={{
        title: "Shaxsiy ma'lumotlar",
        headerShadowVisible: false,
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
        freezeOnBlur:true,
      }}
    />

    <Stack.Screen
      name="PurchaseGroup"
      options={{
        headerShown: false,
        animation: "ios_from_right",
      }}
    >
      {() => (
        <PurchaseProvider>
          <Stack.Navigator
            screenOptions={{
              animation: "ios_from_right",
              headerShown: true,
              headerTintColor: "white",
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
        freezeOnBlur:true,
              headerTitleAlign: "center",
            }}
          >
            <Stack.Screen
              name="PurchaseSubject"
              component={PurchaseSubjectScreen}
            />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen
              name="CreditCardScreen"
              component={CreditCardScreen}
              options={{
                animation: "slide_from_bottom",
        freezeOnBlur:true,
              }}
            />
            <Stack.Screen
              name="OTPCardVerification"
              component={OTPCardVerification}
              options={{
                animation: "slide_from_bottom",
        freezeOnBlur:true,
              }}
            />
            <Stack.Screen
              name="PurchaseSubjectTheme"
              component={PurchaseSubjectThemeScreen}
            />
          </Stack.Navigator>
        </PurchaseProvider>
      )}
    </Stack.Screen>
    <Stack.Screen
      name="PaymentOrders"
      component={PaymentOrders}
      options={{
        title: "Mening to‘lovlarim",
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
        freezeOnBlur:true,
      }}
    />
  </Stack.Navigator>
);

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  // Show loading screen (splash screen) while checking authentication
  useEffect(() => {
    try {
      SystemNavigationBar.setBarMode(theme.isDark ? "light" : "dark");
      SystemNavigationBar.setNavigationColor(theme.colors.tabBarBackground);
    } catch (error) {
      console.warn("SystemNavigationBar error:", error);
    }
  }, [theme]);
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
          // hidden
          backgroundColor={"transparent"}
          barStyle={"light-content"}
        />
        {isAuthenticated ? <MainStackNavigator /> : <LoginScreen />}
      </ThemeProvider>
    </NavigationContainer>
  );
}
