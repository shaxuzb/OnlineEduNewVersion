import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchaseScreen from "../screens/purchases/PurchaseScreen";
import { moderateScale } from "react-native-size-matters";
import CheckoutScreen from "../screens/purchases/CheckoutScreen";
import CreditCardScreen from "../screens/purchases/CreditCardScreen";
import OTPCardVerification from "../screens/purchases/OTPCardVerification";
import PurchasePriceScreen from "../screens/purchases/PurchasePriceScreen";

const Stack = createNativeStackNavigator();
export function PurchaseStack() {
  return (
      <Stack.Navigator
        screenOptions={{
          animation: "ios_from_right",
          freezeOnBlur: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: +moderateScale(18).toFixed(0),
          },
        }}
      >
        <Stack.Screen
          name="PurchaseScreen"
          options={{
            headerShown: true,
            headerTitle: "Obuna rejalarini tanlash",
          }}
          component={PurchaseScreen}
          />
        <Stack.Screen
          name="PurchasePrice"
          options={{
            headerShown: true,
            headerTitle: "Kurs sotib olish",
          }}
          component={PurchasePriceScreen}
        />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen
          name="CreditCardScreen"
          component={CreditCardScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="OTPCardVerification"
          component={OTPCardVerification}
          options={{ animation: "slide_from_bottom",
           }}
        />
      </Stack.Navigator>
  );
}
