import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
        getComponent={() => require("../screens/courses/HomeScreen").default}
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
          headerBackButtonDisplayMode: "minimal",
          headerTitleStyle: {
            fontSize: +moderateScale(18).toFixed(0),
          },
        }}
        getComponent={() => require("../screens/courses/SubjectScreen").default}
      />
    </Stack.Navigator>
  );
}
