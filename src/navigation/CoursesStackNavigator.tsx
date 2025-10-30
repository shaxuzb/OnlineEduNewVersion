import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/courses/HomeScreen";
import SubjectScreen from "../screens/courses/SubjectScreen";
import MilliySertifikatScreen from "../screens/courses/MilliySertifikatScreen";
import CourseDetailScreen from "../screens/courses/CourseDetailScreen";
import { RootStackParamList } from "../types";
import PurchaseSubjectScreen from "../screens/purchases/PurchaseSubjectScreen";
import PurchaseSubjectThemeScreen from "../screens/purchases/PurchaseSubjectThemeScreen";
import CheckoutScreen from "../screens/purchases/CheckoutScreen";
import { PurchaseProvider } from "../context/PurchaseContext";
import CreditCardScreen from "../screens/purchases/CreditCardScreen";
import OTPCardVerification from "../screens/purchases/OTPCardVerification";

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
        options={{ headerShown: false, freezeOnBlur: true }}
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
                headerShown: false,
                animation: "ios_from_right",
              }}
            >
              <Stack.Screen
                name="PurchaseSubject"
                component={PurchaseSubjectScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="CreditCardScreen"
                component={CreditCardScreen}
                options={{
                  headerShown: false,
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="OTPCardVerification"
                component={OTPCardVerification}
                options={{
                  headerShown: false,
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="PurchaseSubjectTheme"
                component={PurchaseSubjectThemeScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </PurchaseProvider>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
