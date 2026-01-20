import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/courses/HomeScreen";
import SubjectScreen from "../screens/courses/SubjectScreen";
import { RootStackParamList } from "../types";
import LinearGradient from "react-native-linear-gradient";
import { moderateScale } from "react-native-size-matters";
import DeviceInfo from "react-native-device-info";
const Stack = createNativeStackNavigator<RootStackParamList>();
const isTablet = DeviceInfo.isTablet();

export function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "ios_from_right",
        headerShown: true,
        headerTintColor: "white",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="CoursesList"
        options={{ headerShown: false, statusBarStyle: "inverted" }}
        component={HomeScreen}
      />
      <Stack.Screen
        name="SubjectScreen"
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
          headerTitleStyle: {
            fontSize: +moderateScale(18).toFixed(0),
          },
        }}
        component={SubjectScreen}
      />
    </Stack.Navigator>
  );
}
