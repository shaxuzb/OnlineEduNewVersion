import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/courses/HomeScreen";
import SubjectScreen from "../screens/courses/SubjectScreen";
import MilliySertifikatScreen from "../screens/courses/MilliySertifikatScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen";
import { RootStackParamList } from "../types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        animation: "ios_from_right",
      }}
    >
      <Stack.Screen
        name="CoursesList"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubjectScreen"
        component={SubjectScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MilliySertifikat"
        component={MilliySertifikatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: "Kurs Detayı" }}
      />
    </Stack.Navigator>
  );
}
