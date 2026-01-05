import Cash from "../../assets/icons/payments/cash.svg";
import Payme from "../../assets/icons/payments/payme.svg";
import { lightColors } from "@/src/constants/theme";
import { usePurchase } from "@/src/context/PurchaseContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import { numberSpacing } from "@/src/utils";
import { queryClient } from "@/src/utils/helpers/queryClient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface PaymentItems {
  label: string;
  icon: any;
  id: number;
  paymentCode: string;
}
const paymentItems: PaymentItems[] = [
  {
    icon: <Cash width={50} height={35} />,
    id: 1,
    label: "Karta raqam",
    paymentCode: "PAYME_SUBSCRIBE",
  },
  {
    icon: <Payme width={50} height={35} />,
    id: 2,
    label: "Payme",
    paymentCode: "PAYME_MERCHANT",
  },
];
export default function CheckoutScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { selectedItems, submitPurchase } = usePurchase();

  const { scopeTypeId } = route.params;
  const totalPrice = useMemo(
    () =>
      numberSpacing(selectedItems.reduce((acc, item) => acc + item.price, 0)),
    [selectedItems]
  );
  const handleSubmit = async (paymentCode: string) => {
    if (paymentCode === "PAYME_SUBSCRIBE") {
      return navigation.navigate("CreditCardScreen", {
        scopeTypeId: scopeTypeId,
        paymentType: paymentCode,
      });
    }
    try {
      const data = await submitPurchase({
        values: { scopeTypeId: Number(scopeTypeId), paymentType: paymentCode },
      });
      queryClient.clear();
      await queryClient.refetchQueries({ queryKey: ["themes"] });
      await Linking.openURL((data as any).paymentUrl);
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
            state: {
              routes: [
                {
                  name: "Courses",
                  state: {
                    routes: [{ name: "CoursesList" }],
                  },
                },
              ],
            },
          },
        ],
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Sotib olishda xatolik yuz berdi!",
      });
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Ionicons name="cart-outline" size={38} color="white" />
      ),
      freezeOnBlur: true,

      headerRight: () => (
        <Pressable
          android_ripple={{
            foreground: true,
            color: lightColors.ripple,
            borderless: true,
            radius: 22,
          }}
          style={{
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("Chat")}
        >
          <Ionicons name="chatbox" size={24} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
