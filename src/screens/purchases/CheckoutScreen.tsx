import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Payme from "@/src/assets/icons/payments/payme.svg";

import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import getQueryClient from "@/src/utils/helpers/queryClient";
import { usePurchase } from "@/src/context/PurchaseContext";
import Toast from "react-native-toast-message";

interface PaymentItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  paymentCode: string;
}

export default function CheckoutScreen({ navigation }: { navigation: any }) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const { selectedItem, submitPurchase } = usePurchase();

  const queries = getQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<number>(1);

  const paymentItems: PaymentItem[] = [
    {
      id: 1,
      label: "Bank kartasi",
      icon: <FontAwesome name="credit-card" size={24} color="#3a5dde" />,
      paymentCode: "PAYME_SUBSCRIBE",
    },
    {
      id: 2,
      label: "Payme",
      icon: <Payme width={50} height={35} />,
      paymentCode: "PAYME_MERCHANT",
    },
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " сум";
  };

  const handlePaymentSelect = async (paymentCode: string) => {
    if (paymentCode === "PAYME_SUBSCRIBE") {
      navigation.navigate("CreditCardScreen", {
        totalPrice: 1,
        paymentType: paymentCode,
      });
    } else {
      try {
        const data = await submitPurchase({
          values: {
            planId: Number(selectedItem?.id),
            paymentType: paymentCode,
          },
        });
        queries.clear();
        await queries.refetchQueries({ queryKey: ["themes"] });
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
    }
  };
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "To'lov",
      headerBackground: () => (
        <View
          style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F9FAFB" }}
        />
      ),
      headerTintColor: theme.colors.text,
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary - Compact */}
        {/* <View style={styles.summaryCompact}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <MaterialIcons name="calendar-today" size={18} color={isDark ? '#94A3B8' : '#6B7280'} />
              <Text style={styles.summaryLabel}>Davomiylik:</Text>
            </View>
            <Text style={styles.summaryValue}>1 yil • Premium+</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryLabelContainer}>
              <MaterialIcons name="payments" size={18} color={isDark ? '#94A3B8' : '#6B7280'} />
              <Text style={styles.summaryLabel}>Narx:</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.originalPrice}>{formatPrice(totalPrice)}</Text>
              <Text style={styles.finalPriceCompact}>{formatPrice(finalPrice)}</Text>
            </View>
          </View>
        </View> */}

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons
              name="payment"
              size={22}
              color={isDark ? "#fff" : "#1F2937"}
            />
            <Text style={styles.sectionTitle}>To'lov usuli</Text>
          </View>

          <View style={styles.paymentMethods}>
            {paymentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.paymentCard,
                  selectedPayment === item.id && styles.paymentCardSelected,
                ]}
                onPress={() => {
                  setSelectedPayment(item.id);
                  handlePaymentSelect(item.paymentCode);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.paymentIcon}>{item.icon}</View>
                <Text
                  style={[
                    styles.paymentLabel,
                    selectedPayment === item.id && styles.paymentLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedPayment === item.id && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#3a5dde"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Detailed Price Breakdown */}
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <MaterialIcons
              name="receipt"
              size={20}
              color={isDark ? "#fff" : "#1F2937"}
            />
            <Text style={styles.breakdownTitle}>To'lov tafsilotlari</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Obuna narxi</Text>
            <Text style={styles.breakdownValue}>
              {formatPrice(selectedItem?.price ?? 0)}
            </Text>
          </View>
          {selectedItem?.annualDiscountPercent ? (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Chegirma</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountLabel}>
                  {(selectedItem as any)?.annualDiscountPercent}%
                </Text>
              </View>
            </View>
          ) : null}
          <View style={styles.breakdownDivider} />

          <View style={[styles.breakdownRow, styles.totalRow]}>
            <View style={styles.totalLabelContainer}>
              <MaterialIcons name="attach-money" size={20} color="#5e84e6" />
              <Text style={styles.totalLabel}>Jami to'lov</Text>
            </View>
            <View style={styles.finalPriceContainer}>
              <Text style={styles.finalPrice}>
                {formatPrice(selectedItem?.price ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <View style={styles.securityIcon}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          </View>
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>100% xavfsiz to'lov</Text>
            <Text style={styles.securityText}>
              Karta ma'lumotlaringiz bank darajasida himoyalangan. To'lov payme
              orqali amalga oshiriladi.
            </Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        <View style={styles.termsCard}>
          <View style={styles.termsIcon}>
            <MaterialIcons name="info" size={18} color="#94A3B8" />
          </View>
          <Text style={styles.termsText}>
            • Obunani istalgan vaqtda bekor qilishingiz mumkin{"\n"}• To'lovdan
            so'ng barcha imkoniyatlar darhol ochiladi{"\n"}• To'lov ma'lumotlari
            maxfiy saqlanadi
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <LinearGradient
          colors={["#3a5dde", "#5e84e6"]}
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.5, y: 0.0 }}
          style={styles.continueButtonGradient}
        >
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              handlePaymentSelect(
                paymentItems.find((p) => p.id === selectedPayment)
                  ?.paymentCode || "",
              )
            }
            activeOpacity={0.9}
          >
            <MaterialIcons name="lock" size={20} color="#fff" />
            <Text style={styles.continueButtonText}>
              Xavfsiz to'lash • {formatPrice(selectedItem?.price ?? 0)}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0F172A" : "#F9FAFB",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#1E293B" : "#E5E7EB",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    summaryCompact: {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#E5E7EB",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    summaryLabel: {
      fontSize: 15,
      color: isDark ? "#94A3B8" : "#6B7280",
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    priceContainer: {
      alignItems: "flex-end",
      gap: 2,
    },
    originalPrice: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#9CA3AF",
      textDecorationLine: "line-through",
    },
    finalPriceCompact: {
      fontSize: 18,
      fontWeight: "700",
      color: "#8B5CF6",
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    paymentMethods: {
      gap: 12,
    },
    paymentCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      borderWidth: 2,
      borderColor: isDark ? "#334155" : "#E5E7EB",
    },
    paymentCardSelected: {
      borderColor: "#5e84e6",
      backgroundColor: isDark ? "#2D1B69" : "#5e84e622",
    },
    paymentIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(139, 92, 246, 0.2)" : "#5e84e622",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    paymentLabel: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
      flex: 1,
    },
    paymentLabelSelected: {
      color: "#3a5dde",
    },
    selectedIndicator: {
      marginLeft: 8,
    },
    breakdownCard: {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#E5E7EB",
      padding: 20,
      marginBottom: 24,
    },
    breakdownHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    breakdownTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    breakdownLabel: {
      fontSize: 15,
      color: isDark ? "#94A3B8" : "#6B7280",
    },
    breakdownValue: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    discountBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      gap: 4,
    },
    discountLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: "#10B981",
    },
    discountValue: {
      color: "#10B981",
    },
    breakdownDivider: {
      height: 1,
      backgroundColor: isDark ? "#334155" : "#E5E7EB",
      marginVertical: 16,
    },
    totalRow: {
      marginBottom: 0,
    },
    totalLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    totalLabel: {
      fontSize: 17,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    finalPriceContainer: {
      alignItems: "flex-end",
    },
    finalPrice: {
      fontSize: 24,
      fontWeight: "800",
      color: "#5e84e6",
    },
    securityCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.1)"
        : "rgba(16, 185, 129, 0.05)",
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
    },
    securityIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
      flexShrink: 0,
    },
    securityContent: {
      flex: 1,
    },
    securityTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
      marginBottom: 4,
    },
    securityText: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#6B7280",
      lineHeight: 18,
    },
    termsCard: {
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.1)"
        : "rgba(229, 231, 235, 0.5)",
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    termsIcon: {
      position: "absolute",
      top: 16,
      left: 16,
    },
    termsText: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#6B7280",
      lineHeight: 18,
      marginLeft: 28,
    },
    footer: {
      padding: 20,
      backgroundColor: isDark ? "#0F172A" : "#F9FAFB",
      borderTopWidth: 1,
      borderTopColor: isDark ? "#1E293B" : "#E5E7EB",
    },
    continueButton: {
      overflow: "hidden",
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    continueButtonGradient: {
      borderRadius: 14,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
