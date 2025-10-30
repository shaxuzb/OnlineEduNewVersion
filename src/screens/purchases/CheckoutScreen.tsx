import React, { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";
// import Cash from "../../assets/icons/payments/cash.svg";
import Payme from "../../assets/icons/payments/payme.svg";
import { usePurchase } from "@/src/context/PurchaseContext";
import { numberSpacing } from "@/src/utils";
import Toast from "react-native-toast-message";
import { queryClient } from "@/src/utils/helpers/queryClient";

interface PaymentItems {
  label: string;
  icon: any;
  id: number;
  paymentCode: string;
}
const paymentItems: PaymentItems[] = [
  // {
  //   icon: <Cash width={50} height={35} />,
  //   id: 1,
  //   label: "Karta raqam",
  //   paymentCode: "PAYME_SUBSCRIBE",
  // },
  {
    icon: <Payme width={50} height={35} />,
    id: 2,
    label: "Payme",
    paymentCode: "PAYME_MERCHANT",
  },
];
export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { selectedItems, submitPurchase } = usePurchase();

  const { scopeTypeId } = route.params as any;
  const totalPrice = useMemo(
    () =>
      numberSpacing(selectedItems.reduce((acc, item) => acc + item.price, 0)),
    [selectedItems]
  );
  const handleSubmit = async (paymentCode: string) => {
    if (paymentCode === "PAYME_SUBSCRIBE") {
      return (navigation as any).navigate("CreditCardScreen", {
        scopeTypeId: scopeTypeId,
        paymentType: paymentCode,
      });
    }
    try {
      const data = await submitPurchase({
        values: { scopeTypeId: scopeTypeId, paymentType: paymentCode },
      });
      queryClient.clear();
      await Linking.openURL((data as any).paymentUrl);

      (navigation as any).navigate("MainTabs", {
        screen: "Courses",
        params: { screen: "CoursesList" },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Sotib olishda xatolik yuz berdi!",
      });
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Ionicons name="cart-outline" size={38} color="white" />

        <TouchableOpacity></TouchableOpacity>
      </View>

      <ScrollView
        style={{
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{totalPrice} UZS</Text>
        </View>
        <View>
          <Text
            style={{
              fontSize: 18,
              color: theme.colors.text,
            }}
          >
            To'lov turini tanlang
          </Text>
          <View
            style={{
              gap: 10,
              marginTop: 10,
            }}
          >
            {paymentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                activeOpacity={0.8}
                onPress={() => handleSubmit(item.paymentCode)}
              >
                {item.icon}
                <Text style={styles.categoryLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={{
              marginTop: 30,
              gap: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                To'lov miqdori
              </Text>
              <Text
                style={{
                  flexGrow: 1,
                  height: 14,
                  marginHorizontal: 5,
                  borderBottomColor: theme.colors.text,
                  borderBottomWidth: 1,
                  borderStyle: "dashed",
                }}
              ></Text>
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                {totalPrice} UZS
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                Komissiya
              </Text>
              <Text
                style={{
                  flexGrow: 1,
                  height: 14,
                  marginHorizontal: 5,
                  borderBottomColor: theme.colors.text,
                  borderBottomWidth: 1,
                  borderStyle: "dashed",
                }}
              ></Text>
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                0 UZS
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.text,
                  fontWeight: "700",
                }}
              >
                Jami to'lov
              </Text>
              <Text
                style={{
                  flexGrow: 1,
                  height: 14,
                  marginHorizontal: 5,
                  borderBottomColor: theme.colors.text,
                  borderBottomWidth: 1,
                  borderStyle: "dashed",
                }}
              ></Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: theme.colors.text,
                }}
              >
                {totalPrice} UZS
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerSelectTotal: {
      fontSize: 13,
      fontWeight: "500",
      color: "white",
    },
    greetingSection: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
    },
    greeting: {
      fontSize: 26,
      fontWeight: "500",
      color: theme.colors.text,
    },
    section: {
      paddingHorizontal: 16,
      gap: 14,
      marginBottom: 24,
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      padding: 5,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    categoryItemSelected: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primarySecondary,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
    },
    categoryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      marginRight: 12,
    },
    categoryLabel: {
      fontSize: 18,
      flex: 1,
      fontWeight: "600",
      color: theme.colors.text,
    },
    categoryLabelSelected: {
      fontSize: 18,
      flex: 1,
      color: theme.colors.primary,
      textAlign: "center",
    },
  });
