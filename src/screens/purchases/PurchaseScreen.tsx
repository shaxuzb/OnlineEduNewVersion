import React, { useEffect, useMemo, useCallback, memo } from "react";
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { useTheme } from "@/src/context/ThemeContext";
import { SubscriptionPlan, SubscriptionPlanOption, Theme } from "@/src/types";

import { FontAwesome6, Octicons } from "@expo/vector-icons";
import { usePurchases } from "@/src/hooks/usePurchases";
import { Periods } from "@/src/constants/periods";
import { numberSpacing } from "@/src/utils";
import { usePurchase } from "@/src/context/PurchaseContext";
import { useAuth } from "@/src/context/AuthContext";
import { useSubscriptionAvailabilityMutation } from "@/src/hooks/useSubscriptionAvailabilityMutation";
import Toast from "react-native-toast-message";

function PurchaseScreen({ navigation }: { navigation: any }) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme]);
  const { setSelectedItem } = usePurchase();
  const { mutate, isPending } = useSubscriptionAvailabilityMutation();

  const { data, isFetching, refetch } = usePurchases();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(refetch);
    return () => task.cancel();
  }, [refetch]);

  const onSelectPrice = useCallback(
    (item: SubscriptionPlan) => {
      if (item.code === "TESTPREMIUM") {
        onPressPlan(item.plans[0]);
      } else {
        navigation.navigate("PurchasePrice", {
          planId: item.id,
        });
      }
    },
    [
      /* navigation */
    ],
  );
  const onPressPlan = (item: SubscriptionPlanOption) => {
    mutate(item.id, {
      onSuccess: (res) => {
        if (!res.isAvailable) {
          Toast.show({
            type: "error",
            text1: res.reason?.uz,
          });
        } else {
          setSelectedItem(item);
          navigation.navigate("Checkout");
        }
      },
    });
  };
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: "Obuna rejalarini tanlash",
      headerBackground: () => (
        <View
          style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F9FAFB" }}
        ></View>
      ),
      headerLeft: () => {
        return (
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
            style={{
              width: 30,
            }}
          >
            <Octicons
              name={Platform.OS === "ios" ? "chevron-left" : "arrow-left"}
              size={
                Platform.OS === "ios" ? moderateScale(34) : moderateScale(22)
              }
              color={isDark ? "#fff" : "#000"}
            />
          </Pressable>
        );
      },
      headerTintColor: theme.colors.text,
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          {/* <Text style={styles.kicker}></Text> */}
          <Text style={styles.headerTitle}>Onlayn Ta’lim Platformasi</Text>
          <Text style={styles.headerDescription}>
            Video darslar, testlar, konspektlar va o‘quv statistikasi orqali
            bilimlaringizni mustahkamlang.
          </Text>
        </View>

        {/* ===== PLANS ===== */}
        <View style={styles.plansWrap}>
          {data
            ? data?.map((p) => (
                <PlanCard
                  key={p.id}
                  isPending={isPending}
                  isDark={isDark}
                  theme={theme}
                  itemPlan={p}
                  onSelect={() => onSelectPrice(p)}
                />
              ))
            : ""}
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          Obuna istalgan vaqtda bekor qilinadi. To‘lovdan so‘ng barcha
          imkoniyatlar darhol ochiladi.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

export default PurchaseScreen;

/* ================== PLAN CARD ================== */

const PlanCard = memo(function PlanCard({
  theme,
  itemPlan,
  isDark,
  onSelect,
  isPending,
}: {
  theme: Theme;
  isPending: boolean;
  isDark: boolean;
  itemPlan: SubscriptionPlan;
  onSelect: (plan: SubscriptionPlan) => void;
}) {
  const styles = useMemo(() => createStyles(theme, isDark), [theme]);
  const isPremium = itemPlan.code === "PREMIUM";
  const { plan } = useAuth();

  const CardContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (!isPremium)
      return (
        <View style={styles.card}>
          <View style={{ padding: 18 }}>{children}</View>
        </View>
      );

    return (
      <LinearGradient
        colors={["#3a5dde", "#5e84e6"]}
        start={{ x: 0.5, y: 1.0 }}
        end={{ x: 0.5, y: 0.0 }}
        style={[styles.card, styles.cardPremium]}
      >
        <View style={{ padding: 18 }}>{children}</View>
      </LinearGradient>
    );
  };

  return (
    <CardContainer>
      {itemPlan.code === "PREMIUM" && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ENG MASHHUR</Text>
        </View>
      )}

      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, isPremium && styles.premiumText]}>
            {itemPlan.name}
          </Text>
          <Text
            style={[styles.cardSubtitle, isPremium && styles.premiumSubText]}
          >
            {itemPlan.description}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, isPremium && styles.premiumText]}>
          {numberSpacing(itemPlan.plans[0]?.price)} UZS
        </Text>
        <Text style={[styles.period, isPremium && styles.premiumSubText]}>
          {(Periods as any)[itemPlan.plans[0]?.periodDurationUnit]?.value}
        </Text>
      </View>

      <View style={styles.features}>
        {itemPlan.features.map((item, idx) => (
          <View key={`${itemPlan.id}-${idx}`} style={styles.featureRow}>
            <View
              style={[styles.iconWrap, isPremium && styles.iconWrapPremium]}
            >
              <FontAwesome6
                name="check"
                size={16}
                color={isPremium ? "#fff" : theme.colors.primary}
              />
            </View>
            <Text style={[styles.featureText, isPremium && styles.premiumText]}>
              {item.description}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      {isPremium ? (
        <Pressable
          onPress={() => onSelect(itemPlan)}
          style={({ pressed }) => [
            styles.cta,
            styles.ctaPremium,
            { opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.ctaTextPremium}>
            {itemPlan.name} tarifni tanlash
          </Text>
        </Pressable>
      ) : (
        <LinearGradient
          colors={["#3a5dde", "#5e84e6"]}
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.5, y: 0.0 }}
          style={[styles.ctaGradient, isPending && { opacity: 0.8 }]}
        >
          <Pressable
            onPress={() => onSelect(itemPlan)}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed ? 0.9 : 1 },
            ]}
            disabled={isPending}
          >
            {isPending && <ActivityIndicator color="white" size="small" />}
            <Text style={styles.ctaText}>{itemPlan.name} tarifni tanlash</Text>
          </Pressable>
        </LinearGradient>
      )}
      {plan && plan?.plan?.tierCode === itemPlan.code && (
        <View style={{ marginTop: 10 }}>
          <Text
            style={[
              {
                fontWeight: "700",
                fontSize: 13,
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 999,
                alignSelf: "flex-start",
              },
              isPremium
                ? { backgroundColor: "#fff", color: "#3a5dde" }
                : { backgroundColor: "#3a5dde", color: "#fff" },
            ]}
          >
            Faol: Ha —{" "}
            {plan.endAt
              ? `Fev ${new Date(plan.endAt).getDate()}, ${new Date(
                  plan.endAt,
                ).getFullYear()} gacha amal qiladi`
              : ""}
          </Text>
        </View>
      )}
    </CardContainer>
  );
});

/* ================= STYLES ================= */

const createStyles = (theme: Theme, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 28,
    },

    /* Header */
    header: {
      paddingHorizontal: 18,
      paddingBottom: 14,
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
    kicker: {
      fontSize: 12,
      letterSpacing: 1.2,
      fontWeight: "800",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "900",
      color: theme.colors.text,
      letterSpacing: -0.4,
      marginBottom: 10,
    },
    headerDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.textSecondary,
    },

    plansWrap: {
      paddingHorizontal: 16,
      gap: 14,
      marginTop: 10,
    },

    /* Card */
    card: {
      borderRadius: 22,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.09,
          shadowRadius: 18,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    cardPremium: {
      borderWidth: 0,
      overflow: "hidden",
    },

    badge: {
      position: "absolute",
      top: 14,
      right: 14,
      backgroundColor: "#FFD700",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#000",
      letterSpacing: 0.4,
    },

    cardHeaderRow: {
      paddingRight: 86, // badge joyi uchun
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 6,
    },
    cardSubtitle: {
      fontSize: 13.5,
      lineHeight: 19,
      color: theme.colors.textSecondary,
      marginBottom: 14,
    },

    priceRow: {
      alignItems: "center",
      marginBottom: 14,
    },
    price: {
      fontSize: 38,
      fontWeight: "900",
      letterSpacing: -0.8,
      color: theme.colors.primary,
    },
    period: {
      fontSize: 13,
      marginTop: 2,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },

    /* Features */
    features: {
      gap: 10,
      marginBottom: 16,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(48,85,221,0.10)",
    },
    iconWrapPremium: {
      backgroundColor: "rgba(255,255,255,0.18)",
    },
    featureText: {
      flex: 1,
      fontSize: moderateScale(13),
      lineHeight: 18,
      fontWeight: "600",
      color: theme.colors.text,
    },

    /* Text overrides for premium */
    premiumText: { color: "#fff" },
    premiumSubText: { color: "rgba(255,255,255,0.85)" },

    /* CTA */
    ctaGradient: {
      borderRadius: 999,
      overflow: "hidden",
    },
    cta: {
      paddingVertical: moderateScale(14),
      borderRadius: 999,
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaText: {
      fontSize: moderateScale(15),
      fontWeight: "800",
      letterSpacing: 0.2,
      color: "#fff",
    },

    ctaPremium: {
      backgroundColor: theme.colors.background,
    },
    ctaTextPremium: {
      fontSize: moderateScale(15),
      fontWeight: "900",
      letterSpacing: 0.2,
      color: theme.colors.text,
    },

    footerNote: {
      paddingHorizontal: 18,
      marginTop: 16,
      fontSize: 12.5,
      lineHeight: 18,
      color: theme.colors.textSecondary,
      opacity: 0.9,
    },
  });
