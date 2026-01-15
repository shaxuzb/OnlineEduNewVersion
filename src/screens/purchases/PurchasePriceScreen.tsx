import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";

import { useTheme } from "@/src/context/ThemeContext";
import { SubscriptionPlanOption, Theme } from "@/src/types";
import { usePurchaseById } from "@/src/hooks/usePurchases";
import { Periods } from "@/src/constants/periods";
import { usePurchase } from "@/src/context/PurchaseContext";
import { moderateScale } from "react-native-size-matters";
// interface PromoCode {
//   code: string;
//   discount: number;
//   type: "percentage" | "fixed";
// }

export default function PurchasePriceScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const { planId } = route.params;
  const { data, isLoading, isFetching, isSuccess } = usePurchaseById(planId);
  const { selectedItem, setSelectedItem } = usePurchase();
  // const [promoCode, setPromoCode] = useState<string>("");
  // const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  // const [isPromoValid, setIsPromoValid] = useState<boolean>(true);

  // const mockPromoCodes: PromoCode[] = [
  //   { code: "WELCOME10", discount: 10, type: "percentage" },
  //   { code: "PREMIUM15", discount: 15, type: "percentage" },
  //   { code: "SUMMER20", discount: 20000, type: "fixed" },
  // ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  const calculateSavings = (option: SubscriptionPlanOption) => {
    if (option.annualDiscountPercent === 0) return 0;
    const originalPrice =
      (option.price /
        (option.periodDurationUnit === "YEAR"
          ? 12
          : option.periodDurationValue)) *
      (option.periodDurationUnit === "YEAR" ? 12 : option.periodDurationValue);
    return originalPrice - option.price;
  };

  // const applyPromoCode = () => {
  //   const promo = mockPromoCodes.find(
  //     (p) => p.code === promoCode.toUpperCase()
  //   );
  //   if (promo) {
  //     setAppliedPromo(promo);
  //     setIsPromoValid(true);
  //   } else {
  //     setAppliedPromo(null);
  //     setIsPromoValid(false);
  //   }
  // };

  const calculateFinalPrice = () => {
    let price = selectedItem?.price || 0;

    // if (appliedPromo) {
    //   if (appliedPromo.type === "percentage") {
    //     price = price * (1 - appliedPromo.discount / 100);
    //   } else {
    //     price = Math.max(0, price - appliedPromo.discount);
    //   }
    // }

    return Math.round(price);
  };

  // const removePromoCode = () => {
  //   setAppliedPromo(null);
  //   setPromoCode("");
  //   setIsPromoValid(true);
  // };

  const handleContinue = () => {
    // Navigate to payment screen with selected data
    navigation.navigate("Checkout");
  };
  useEffect(() => {
    if (isSuccess && data) {
      // Set default selected item to the first plan option
      setSelectedItem(data.plans[0]);
    }
  }, [isSuccess, data]);
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle={isDark ? "light-content" : "dark-content"} /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{data?.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subtitle}>{data?.description}</Text>

        {/* Subscription Options */}
        <View style={styles.optionsContainer}>
          {data?.plans.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedItem?.periodCode === option.periodCode &&
                  styles.selectedOptionCard,
              ]}
              onPress={() => setSelectedItem(option)}
              activeOpacity={0.8}
            >
              {option.periodCode === "P1Y" && (
                <View style={styles.bestValueBadge}>
                  <MaterialIcons name="star" size={12} color="#fff" />
                  <Text style={styles.bestValueText}>Eng foydali</Text>
                </View>
              )}

              <View style={styles.optionHeader}>
                <View style={styles.optionDuration}>
                  <Text
                    style={[
                      styles.durationText,
                      selectedItem?.periodCode === option.periodCode &&
                        styles.durationTextSelected,
                    ]}
                  >
                    {(Periods as any)[option.periodCode].value}
                  </Text>
                  {selectedItem?.periodCode === option.periodCode && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </View>

                {option.annualDiscountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      Chegirma {option.annualDiscountPercent}
                      <MaterialIcons name="percent" size={12} color="#10B981" />
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.priceSection}>
                <View style={styles.monthlyPriceRow}>
                  <Text style={styles.monthlyPriceLabel}>Oylik:</Text>
                  <Text
                    style={[
                      styles.monthlyPrice,
                      selectedItem?.periodCode === option.periodCode &&
                        styles.monthlyPriceSelected,
                    ]}
                  >
                    {formatPrice(
                      option.price /
                        (option.periodDurationUnit === "YEAR"
                          ? 12
                          : option.periodDurationValue)
                    )}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.totalPrice,
                    selectedItem?.periodCode === option.periodCode &&
                      styles.totalPriceSelected,
                  ]}
                >
                  {formatPrice(option.price)}
                </Text>

                {option.annualDiscountPercent > 0 && (
                  <Text style={styles.savingsText}>
                    {formatPrice(calculateSavings(option))} tejaysiz
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Code Section
          <View style={styles.promoSection}>
            <View style={styles.promoHeader}>
              <MaterialIcons
                name="local-offer"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.promoTitle}>Promo kod</Text>
            </View>

            {appliedPromo ? (
              <View style={styles.appliedPromoCard}>
                <View style={styles.promoInfo}>
                  <Text style={styles.promoCodeText}>{appliedPromo.code}</Text>
                  <Text style={styles.promoDiscountText}>
                    {appliedPromo.type === "percentage"
                      ? `${appliedPromo.discount}% chegirma`
                      : `${formatPrice(appliedPromo.discount)} chegirma`}
                  </Text>
                </View>
                <TouchableOpacity onPress={removePromoCode}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.promoInputContainer}>
                <TextInput
                  style={[
                    styles.promoInput,
                    !isPromoValid && styles.promoInputError,
                  ]}
                  placeholder="Promo kodni kiriting"
                  placeholderTextColor={isDark ? "#94A3B8" : "#9CA3AF"}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    (!promoCode || promoCode.length < 3) &&
                      styles.applyButtonDisabled,
                  ]}
                  onPress={applyPromoCode}
                  disabled={!promoCode || promoCode.length < 3}
                >
                  <Text style={styles.applyButtonText}>Qo'llash</Text>
                </TouchableOpacity>
              </View>
            )}

            {!isPromoValid && !appliedPromo && (
              <Text style={styles.errorText}>
                Noto'g'ri promo kod. Quyidagilardan birini sinab ko'ring:
              </Text>
            )}

            {(!isPromoValid || !appliedPromo) && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.promoExamples}
              >
                {mockPromoCodes.map((promo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promoExampleBadge}
                    onPress={() => {
                      setPromoCode(promo.code);
                      applyPromoCode();
                    }}
                  >
                    <MaterialIcons name="tag" size={14} color="#8B5CF6" />
                    <Text style={styles.promoExampleText}>{promo.code}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View> */}

        {/* Summary Card
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <MaterialIcons
                name="receipt"
                size={20}
                color={isDark ? "#fff" : "#1F2937"}
              />
              <Text style={styles.summaryTitle}>Buyurtma hisobi</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tanlangan tarif:</Text>
              <Text style={styles.summaryValue}>
                {selectedPlan?.duration} •{" "}
                {formatPrice(selectedPlan?.totalPrice || 0)}
              </Text>
            </View>

            {appliedPromo && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promo kod:</Text>
                <View style={styles.promoDiscountRow}>
                  <MaterialIcons name="discount" size={16} color="#10B981" />
                  <Text style={styles.discountValue}>
                    {appliedPromo.type === "percentage"
                      ? `-${appliedPromo.discount}%`
                      : `-${formatPrice(appliedPromo.discount)}`}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View style={styles.totalLabelContainer}>
                <MaterialIcons
                  name="payments"
                  size={20}
                  color={isDark ? "#fff" : "#1F2937"}
                />
                <Text style={styles.totalLabel}>Jami to'lov:</Text>
              </View>
              <View style={styles.totalPriceContainer}>
                {appliedPromo && (
                  <Text style={styles.originalPrice}>
                    {formatPrice(selectedPlan?.totalPrice || 0)}
                  </Text>
                )}
                <Text style={styles.finalPrice}>
                  {formatPrice(calculateFinalPrice())}
                </Text>
              </View>
            </View>
          </View> */}

        {/* Info Box */}
        {/* <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <Text style={styles.infoText}>
              100% xavfsiz to'lov. Har qanday vaqtda bekor qilishingiz mumkin.
            </Text>
          </View> */}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#3a5dde", "#5e84e6"]}
            start={{ x: 0.5, y: 1.0 }}
            end={{ x: 0.5, y: 0.0 }}
            style={styles.continueButtonGradient}
          >
            <FontAwesome name="credit-card-alt" size={20} color="#fff" />
            <Text style={styles.continueButtonText}>
              To'lovga o'tish • {formatPrice(calculateFinalPrice())}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const createStyles = (theme: Theme, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#0F172A" : "#F9FAFB",
    },
    scrollContent: {
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 2,
      marginBottom: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? "#94A3B8" : "#6B7280",
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 22,
    },
    optionsContainer: {
      gap: 12,
      marginBottom: 32,
    },
    optionCard: {
      backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      borderWidth: 2,
      borderColor: isDarkMode ? "#334155" : "#E5E7EB",
      position: "relative",
      overflow: "hidden",
    },
    selectedOptionCard: {
      borderColor: "#5e84e6",
      backgroundColor: isDarkMode ? "#2D1B69" : "#5e84e622",
    },
    bestValueBadge: {
      position: "absolute",
      top: 2,
      left: 12,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#10B981",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
    },
    bestValueText: {
      fontSize: 11,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    optionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
    },
    optionDuration: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    durationText: {
      fontSize: 24,
      fontWeight: "700",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    durationTextSelected: {
      color: "#5e84e6",
    },
    selectedIndicator: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#5e84e6",
      alignItems: "center",
      justifyContent: "center",
    },
    discountBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      gap: 4,
    },
    discountText: {
      fontSize: moderateScale(11),
      fontWeight: "600",
      color: "#10B981",
    },
    priceSection: {
      gap: 4,
    },
    monthlyPriceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
    },
    monthlyPriceLabel: {
      fontSize: 14,
      color: isDarkMode ? "#94A3B8" : "#6B7280",
    },
    monthlyPrice: {
      fontSize: 20,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    monthlyPriceSelected: {
      color: "#5e84e6",
    },
    totalPrice: {
      fontSize: 32,
      fontWeight: "800",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    totalPriceSelected: {
      color: "#5e84e6",
    },
    savingsText: {
      fontSize: 14,
      color: "#10B981",
      fontWeight: "500",
    },
    promoSection: {
      marginBottom: 32,
    },
    promoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 12,
    },
    promoTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    promoInputContainer: {
      flexDirection: "row",
      gap: 12,
    },
    promoInput: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDarkMode ? "#475569" : "#D1D5DB",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    promoInputError: {
      borderColor: "#EF4444",
    },
    applyButton: {
      backgroundColor: "#8B5CF6",
      borderRadius: 12,
      paddingHorizontal: 20,
      justifyContent: "center",
    },
    applyButtonDisabled: {
      backgroundColor: isDarkMode ? "#475569" : "#D1D5DB",
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    appliedPromoCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: isDarkMode
        ? "rgba(139, 92, 246, 0.2)"
        : "rgba(139, 92, 246, 0.1)",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: "rgba(139, 92, 246, 0.3)",
    },
    promoInfo: {
      gap: 4,
    },
    promoCodeText: {
      fontSize: 16,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    promoDiscountText: {
      fontSize: 14,
      color: "#8B5CF6",
      fontWeight: "500",
    },
    errorText: {
      fontSize: 14,
      color: "#EF4444",
      marginTop: 8,
      marginBottom: 12,
    },
    promoExamples: {
      marginTop: 12,
    },
    promoExampleBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDarkMode ? "#475569" : "#D1D5DB",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 8,
      gap: 6,
    },
    promoExampleText: {
      fontSize: 14,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    summaryCard: {
      backgroundColor: isDarkMode ? "#1E293B" : "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    summaryLabel: {
      fontSize: 15,
      color: isDarkMode ? "#94A3B8" : "#6B7280",
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "500",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    promoDiscountRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    discountValue: {
      fontSize: 15,
      fontWeight: "600",
      color: "#10B981",
    },
    divider: {
      height: 1,
      backgroundColor: isDarkMode ? "#334155" : "#E5E7EB",
      marginVertical: 16,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    totalLabel: {
      fontSize: 18,
      fontWeight: "600",
      color: isDarkMode ? "#FFFFFF" : "#1F2937",
    },
    totalPriceContainer: {
      alignItems: "flex-end",
      gap: 2,
    },
    originalPrice: {
      fontSize: 14,
      color: isDarkMode ? "#94A3B8" : "#9CA3AF",
      textDecorationLine: "line-through",
    },
    finalPrice: {
      fontSize: 24,
      fontWeight: "700",
      color: "#8B5CF6",
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDarkMode
        ? "rgba(59, 130, 246, 0.1)"
        : "rgba(59, 130, 246, 0.05)",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      gap: 12,
    },
    infoIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: isDarkMode ? "#94A3B8" : "#6B7280",
      lineHeight: 20,
    },
    footer: {
      padding: 20,
      backgroundColor: isDarkMode ? "#0F172A" : "#F9FAFB",
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? "#1E293B" : "#E5E7EB",
    },
    continueButton: {
      borderRadius: 16,
      overflow: "hidden",
    },
    continueButtonGradient: {
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
  });
