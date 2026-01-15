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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { useTheme } from "@/src/context/ThemeContext";
import { SubscriptionPlan, Theme } from "@/src/types";

import { FontAwesome6 } from "@expo/vector-icons";
import { usePurchases } from "@/src/hooks/usePurchases";
import { Periods } from "@/src/constants/periods";
import { numberSpacing } from "@/src/utils";

function PurchaseScreen({ navigation }: { navigation: any }) {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading, isFetching, refetch } = usePurchases();

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(refetch);
    return () => task.cancel();
  }, [refetch]);

  const onSelectPrice = useCallback(
    (planId: SubscriptionPlan["id"]) => {
      navigation.navigate("PurchasePrice", {
        planId,
      });
    },
    [
      /* navigation */
    ]
  );
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
      >
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.kicker}>OBUNA</Text>
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
                  theme={theme}
                  plan={p}
                  onSelect={() => onSelectPrice(p.id)}
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
  plan,
  onSelect,
}: {
  theme: Theme;
  plan: SubscriptionPlan;
  onSelect: (planId: number) => void;
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPremium = plan.code === "PREMIUM";

  const CardContainer: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    if (!isPremium) return <View style={styles.card}>{children}</View>;

    return (
      <LinearGradient
        colors={["#3a5dde", "#5e84e6"]}
        start={{ x: 0.5, y: 1.0 }}
        end={{ x: 0.5, y: 0.0 }}
        style={[styles.card, styles.cardPremium]}
      >
        {children}
      </LinearGradient>
    );
  };

  return (
    <CardContainer>
      {plan.code === "PREMIUM" && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ENG MASHHUR</Text>
        </View>
      )}

      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, isPremium && styles.premiumText]}>
            {plan.name}
          </Text>
          <Text
            style={[styles.cardSubtitle, isPremium && styles.premiumSubText]}
          >
            {plan.description}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={[styles.price, isPremium && styles.premiumText]}>
          {numberSpacing(plan.plans[0]?.price)} UZS
        </Text>
        <Text style={[styles.period, isPremium && styles.premiumSubText]}>
          {(Periods as any)[plan.plans[0]?.periodDurationUnit]?.value}
        </Text>
      </View>

      <View style={styles.features}>
        {plan.features.map((item, idx) => (
          <View key={`${plan.id}-${idx}`} style={styles.featureRow}>
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
          onPress={() => onSelect(plan.id)}
          style={({ pressed }) => [
            styles.cta,
            styles.ctaPremium,
            { opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.ctaTextPremium}>Premium tarifni tanlash</Text>
        </Pressable>
      ) : (
        <LinearGradient
          colors={["#3a5dde", "#5e84e6"]}
          start={{ x: 0.5, y: 1.0 }}
          end={{ x: 0.5, y: 0.0 }}
          style={styles.ctaGradient}
        >
          <Pressable
            onPress={() => onSelect(plan.id)}
            style={({ pressed }) => [
              styles.cta,
              { opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={styles.ctaText}>Standart tarifni tanlash</Text>
          </Pressable>
        </LinearGradient>
      )}
    </CardContainer>
  );
});

/* ================= STYLES ================= */

const createStyles = (theme: Theme) =>
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
      paddingTop: 18,
      paddingBottom: 14,
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
      padding: 18,
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
