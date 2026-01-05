import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/courses/HomeScreen";
import SubjectScreen from "../screens/courses/SubjectScreen";
import { RootStackParamList } from "../types";
// import PurchaseSubjectScreen from "../screens/purchases/PurchaseSubjectScreen";
// import PurchaseSubjectThemeScreen from "../screens/purchases/PurchaseSubjectThemeScreen";
// import CheckoutScreen from "../screens/purchases/CheckoutScreen";
// import { PurchaseProvider } from "../context/PurchaseContext";
// import CreditCardScreen from "../screens/purchases/CreditCardScreen";
// import OTPCardVerification from "../screens/purchases/OTPCardVerification";
import LinearGradient from "react-native-linear-gradient";
const Stack = createNativeStackNavigator<RootStackParamList>();

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
        options={{ headerShown: false,statusBarStyle: "inverted" }}
        component={HomeScreen}
      />
      <Stack.Screen
        name="SubjectScreen"
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
        }}
        component={SubjectScreen}
      />
     
    </Stack.Navigator>
  );
}
