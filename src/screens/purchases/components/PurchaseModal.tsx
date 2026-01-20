import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { moderateScale, scale } from "react-native-size-matters";
import { usePurchases } from "@/src/hooks/usePurchases";
import { usePurchase } from "@/src/context/PurchaseContext";
import { modalService } from "@/src/components/modals/modalService";
import { useTheme } from "@/src/context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Periods } from "@/src/constants/periods";
import { useSubscriptionAvailabilityMutation } from "@/src/hooks/useSubscriptionAvailabilityMutation";
import { SubscriptionPlanOption } from "@/src/types";
import Toast from "react-native-toast-message";

// Agar loyihangizda theme hook mavjud bo'lsa shunday ishlatasiz:
// import { useTheme } from '@/src/context/ThemeContext';
// const { isDark } = useTheme();

const COLORS = {
  dark: {
    bgGradient: ["rgba(10,15,35,0.68)", "rgba(8,12,35,0.82)"],
    card: "rgba(255,255,255,0.16)",
    cardActive: "rgba(255,255,255,0.32)",
    textPrimary: "#ffffff",
    textSecondary: "rgba(255,255,255,0.70)",
    accent: "#6366f1",
    border: "rgba(255,255,255,0.18)",
    tabBg: "rgba(255,255,255,0.09)",
    tabActive: "rgba(255,255,255,0.24)",
    success: "#34d399",
    blurTint: "dark" as const,
    blurIntensity: Platform.OS === "ios" ? 70 : 95,
    statusBar: "light-content" as const,
  },
  light: {
    bgGradient: ["rgba(235,240,255,0.75)", "rgba(220,230,255,0.88)"],
    card: "rgba(255,255,255,0.94)",
    cardActive: "rgba(230,235,255,0.97)",
    textPrimary: "#111827",
    textSecondary: "#4b5563",
    accent: "#6366f1",
    border: "rgba(99,102,241,0.24)",
    tabBg: "rgba(220,225,255,0.55)",
    tabActive: "rgba(230,235,255,0.97)",
    success: "#10b981",
    blurTint: "light" as const,
    blurIntensity: Platform.OS === "ios" ? 85 : 70,
    statusBar: "dark-content" as const,
  },
};

export const PurchaseModal = (/* { isDark }: PurchaseModalProps */) => {
  const { isDark } = useTheme();
  const navigation = useNavigation<any>();
  const theme: any = isDark ? COLORS.dark : COLORS.light;
  const { mutate, isPending } = useSubscriptionAvailabilityMutation();
  const { data, isSuccess } = usePurchases();
  const { selectedItem, setSelectedItem } = usePurchase();

  const plans = useMemo(() => data ?? [], [data]);

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [visible, setVisible] = useState(false);
  const onClose = () => {
    setVisible(false);
  };
  const handlePressBuy = () => {
    if (selectedItem) {
      onPressPlan(selectedItem);
    }
  };
  const onPressPlan = (item: SubscriptionPlanOption) => {
    mutate(item.id, {
      onSuccess: (res) => {
        if (!res.isAvailable) {
          Toast.show({
            type: "error",
            text1: res.reason?.uz,
          });
        } else {
          navigation.navigate("Checkout");
        }
      },
    });
  };
  useEffect(() => {
    if (isSuccess && plans.length > 0) {
      setSelectedPlan(plans[2]);
      setSelectedItem(plans[2].plans[0]);
    }
  }, [isSuccess, plans, setSelectedItem]);

  useEffect(() => {
    modalService.subscribe(setVisible);
    return () => modalService.unsubscribe();
  }, []);

  const formatPrice = (price?: number) => price?.toLocaleString("uz-UZ") ?? "0";
  const getMonthly = (p: any) =>
    Math.round(
      p.price / (p.periodDurationUnit === "YEAR" ? 12 : p.periodDurationValue),
    );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <BlurView
        intensity={theme.blurIntensity}
        tint={theme.blurTint}
        experimentalBlurMethod="dimezisBlurView"
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar barStyle={theme.statusBar} backgroundColor="transparent" />

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.inner}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Obunalar
                </Text>
                <TouchableOpacity style={styles.close} onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={scale(24)}
                    color={theme.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              {/* Plan tabs */}
              <View style={[styles.tabs, { backgroundColor: theme.tabBg }]}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.tab,
                      selectedPlan?.id === plan.id && {
                        backgroundColor: theme.tabActive,
                      },
                    ]}
                    onPress={() => {
                      setSelectedPlan(plan);
                      setSelectedItem(plan.plans[0]);
                    }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        {
                          color:
                            selectedPlan?.id === plan.id
                              ? theme.textPrimary
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {plan.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Periods */}
              {selectedPlan && (
                <View style={styles.periods}>
                  {selectedPlan.plans.map((period) => (
                    <TouchableOpacity
                      key={period.id}
                      style={[
                        styles.period,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                        selectedItem?.id === period.id && {
                          backgroundColor: theme.cardActive,
                          borderColor: theme.accent,
                        },
                      ]}
                      onPress={() => setSelectedItem(period)}
                    >
                      <View style={styles.headerContainer}>
                        <View style={styles.periodHeader}>
                          <Text
                            style={[
                              styles.periodName,
                              { color: theme.textPrimary },
                              selectedItem?.id === period.id && {
                                color: theme.textPrimary,
                              },
                            ]}
                          >
                            {(Periods as any)[period.periodCode]?.value}
                          </Text>

                          {period.annualDiscountPercent > 0 && (
                            <View style={styles.discount}>
                              <Text style={styles.discountText}>
                                −{period.annualDiscountPercent}%
                              </Text>
                            </View>
                          )}
                        </View>
                        {period.periodCode !== "P3D" &&
                          period.periodCode !== "P1M" && (
                            <Text
                              style={[
                                styles.price,
                                { color: theme.textPrimary },
                                selectedItem?.id === period.id && {
                                  color: theme.textPrimary,
                                },
                              ]}
                            >
                              {formatPrice(period.price)} so‘m
                            </Text>
                          )}
                      </View>

                      <Text
                        style={[
                          styles.monthly,
                          {
                            color:
                              selectedItem?.id === period.id
                                ? theme.textPrimary
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {period.periodCode === "P3D"
                          ? formatPrice(period.price)
                          : formatPrice(getMonthly(period))}{" "}
                        so‘m{period.periodCode !== "P3D" && "/oy"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Features */}
              {selectedPlan && (
                <View
                  style={[styles.features, { backgroundColor: theme.card }]}
                >
                  {selectedPlan.features.map((f) => (
                    <View key={f.id} style={styles.feature}>
                      <Ionicons
                        name="checkmark-circle"
                        size={scale(18)}
                        color={theme.success}
                      />
                      <Text
                        style={[
                          styles.featureText,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {f.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
          <View style={{ paddingHorizontal: scale(14) }}>
            <LinearGradient
              colors={[theme.accent, isDark ? "#4f46e5" : "#4f46e5"]}
              style={[styles.gradient, isPending && { opacity: 0.8 }]}
            >
              <TouchableOpacity
                style={styles.buyButton}
                onPress={handlePressBuy}
                activeOpacity={0.85}
                disabled={isPending}
              >
                {isPending && <ActivityIndicator color="white" size="small" />}
                <Text style={styles.buyText}>
                  {formatPrice(selectedItem?.price)} so‘m • Sotib olish
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: scale(16),
  },
  inner: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(22),
  },
  title: {
    fontSize: scale(22),
    fontWeight: "700",
  },
  close: { padding: scale(8) },

  tabs: {
    flexDirection: "row",
    borderRadius: 14,
    padding: scale(4),
    marginBottom: scale(24),
  },
  tab: {
    flex: 1,
    paddingVertical: scale(10),
    alignItems: "center",
    borderRadius: 10,
  },
  tabText: {
    fontSize: scale(13),
    fontWeight: "600",
  },

  periods: {
    flexDirection: "column",
    gap: scale(12),
    marginBottom: scale(28),
  },
  headerContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  period: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: moderateScale(14),
    flexDirection: "row",
    height: moderateScale(70),
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  periodHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  periodName: {
    fontSize: scale(13.5),
    fontWeight: "600",
  },
  discount: {
    backgroundColor: "#ec4899",
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(10),
    marginLeft: moderateScale(4),
  },
  discountText: {
    color: "white",
    fontSize: scale(10),
    fontWeight: "700",
  },
  price: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    marginVertical: scale(2),
  },
  monthly: {
    fontSize: scale(12.5),
    fontWeight: "600",
  },

  features: {
    borderRadius: 16,
    padding: scale(14),
    marginBottom: scale(28),
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: scale(7),
  },
  featureText: {
    fontSize: scale(13),
    marginLeft: scale(10),
  },

  buyButton: {
    overflow: "hidden",
    paddingVertical: scale(16),
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  gradient: {
    marginBottom: scale(14),
    borderRadius: 18,
  },
  buyText: {
    color: "#ffffff",
    fontSize: scale(14.5),
    fontWeight: "700",
  },

  later: {
    paddingVertical: scale(16),
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
  },
  laterText: {
    fontSize: scale(14),
    fontWeight: "600",
  },
});
