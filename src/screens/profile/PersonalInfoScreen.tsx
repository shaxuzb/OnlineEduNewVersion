import { alertService } from "@/src/components/modals/customalert/alertService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { $axiosPrivate } from "@/src/services/AxiosService";
import { Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import React, { memo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

function UserDetailScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const mutation = useMutation({
    mutationFn: async () => {
      await $axiosPrivate.delete("/account/my-account");
    },
  });
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debug: user ma'lumotlarini ko'rish (development uchun)
  // console.log("PersonalInfoScreen - User data:", user);

  const refetch = async () => {
    // User ma'lumotlari AuthContext dan keladi, qayta yuklash kerak emas
    setIsLoading(false);
  };
  const deleteAccount = () => {
    mutation.mutate(undefined, {
      onSuccess: () => {
        logout();
      },
      onError: (err: any) => {
        alertService.open({
          title: "Xatolik",
          description:
            "Hisobni o'chirishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        });
      },
    });
  };

  // Ma'lumotlar strukturasi
  const userData = user;

  // renderInfoItem funksiyasi yangi design da ishlatilmaydi

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shaxsiy ma'lumotlar</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ marginBottom: moderateScale(20) }}
          />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Ma'lumotlar yuklanmoqda...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <View
            style={[
              styles.errorIconContainer,
              { backgroundColor: theme.colors.error + "20" },
            ]}
          >
            <Ionicons name="warning" size={50} color={theme.colors.error} />
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Ma'lumotlar yuklanmadi
          </Text>
          <Text
            style={[styles.errorMessage, { color: theme.colors.textSecondary }]}
          >
            Internet aloqangizni tekshiring va qayta urinib ko'ring
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: moderateScale(100) }}
        showsVerticalScrollIndicator={false}
        snapToEnd
        snapToStart={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Header gradientli qism */}
        <View style={styles.profileHeader}>
          {/* Profile rasm */}
          <View style={styles.profileImageContainer}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          {/* Foydalanuvchi ismi */}
          <Text style={styles.profileName}>
            {userData?.fullName || "Foydalanuvchi"}
          </Text>

          {/* Rol */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {userData?.role || "Foydalanuvchi"}
            </Text>
          </View>
        </View>

        {/* Ma'lumotlar kartochkalari */}
        <View style={styles.cardsContainer}>
          {/* Asosiy ma'lumotlar */}
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-circle"
                size={moderateScale(20)}
                color={theme.colors.primary}
                style={{ marginRight: moderateScale(12) }}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Asosiy ma'lumotlar
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                To'liq ism
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {userData?.fullName || "Ma'lumot yo'q"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                Foydalanuvchi nomi
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="at"
                  size={moderateScale(14)}
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {userData?.userName || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>

            {/* <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                Lavozim
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {userData?.role || "Ma'lumot yo'q"}
              </Text>
            </View> */}
          </View>

          {/* Aloqa ma'lumotlari */}
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="call"
                size={moderateScale(20)}
                color={theme.colors.primary}
                style={{ marginRight: moderateScale(12) }}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Aloqa ma'lumotlari
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                Telefon raqam
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="call"
                  size={moderateScale(14)}
                  color={theme.colors.primary}
                  style={{ marginRight: moderateScale(8) }}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {userData?.phoneNumber || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                Hudud
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="location"
                  size={moderateScale(14)}
                  color={theme.colors.primary}
                  style={{ marginRight: moderateScale(8) }}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {userData?.state || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>
          </View>

          {/* Hisob ma'lumotlari */}
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(20)}
                color={theme.colors.primary}
                style={{ marginRight: moderateScale(12) }}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Hisob ma'lumotlari
              </Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text
                style={[styles.infoLabel, { color: theme.colors.textMuted }]}
              >
                Hisob holati
              </Text>
              <View style={styles.infoWithIcon}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: theme.colors.success },
                  ]}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {userData?.state || "Faol"}
                </Text>
              </View>
            </View>
          </View>

          {/* Ruxsatlar va Modullar */}
          <TouchableOpacity
            disabled={mutation.isPending}
            onPress={() => {
              alertService.open({
                title: "Hisobni o‘chirish",
                description:
                  "Hisobingiz butunlay o‘chiriladi. Bu amalni ortga qaytarib bo‘lmaydi!",
                okText: "O‘chirish",
                onOk: deleteAccount,
              });
            }}
            style={[styles.deleteButtonLarge, { opacity: isLoading ? 0.7 : 1 }]}
          >
            <View style={styles.refreshButtonContent}>
              {mutation.isPending ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: moderateScale(8) }}
                />
              ) : (
                <Ionicons
                  name="trash"
                  size={moderateScale(18)}
                  color="white"
                  style={{ marginRight: moderateScale(8) }}
                />
              )}
              <Text style={styles.refreshButtonText}>Hisobni o'chirish</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refetch()}
            disabled={isLoading}
            style={[
              styles.refreshButtonLarge,
              { opacity: isLoading ? 0.7 : 1 },
            ]}
          >
            <View style={styles.refreshButtonContent}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: moderateScale(8) }}
                />
              ) : (
                <Ionicons
                  name="refresh"
                  size={moderateScale(18)}
                  color="white"
                  style={{ marginRight: moderateScale(8) }}
                />
              )}
              <Text style={styles.refreshButtonText}>
                {isLoading ? "Yangilanmoqda..." : "Ma'lumotlarni yangilash"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default memo(UserDetailScreen);
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Container
    container: {
      flex: 1,
    },
    // Header styles
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(16),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      marginLeft: 0,
    },
    headerTitle: {
      fontSize: moderateScale(20),
      color: "white",
      fontWeight: "600",
    },
    placeholder: {
      width: 32,
    },

    // Profile header styles
    profileHeader: {
      backgroundColor: "#3a5dde",
      paddingTop: moderateScale(20),
      paddingBottom: moderateScale(40),
      borderBottomLeftRadius: moderateScale(30),
      borderBottomRightRadius: moderateScale(30),
      alignItems: "center",
    },
    profileImageContainer: {
      width: moderateScale(120),
      height: moderateScale(120),
      borderRadius: moderateScale(60),
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: moderateScale(20),
      borderWidth: moderateScale(4),
      borderColor: "rgba(255,255,255,0.3)",
    },
    profileImage: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
    },
    profileName: {
      fontSize: moderateScale(24),
      fontWeight: "700",
      color: "white",
      marginBottom: moderateScale(8),
      textAlign: "center",
    },
    roleBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: moderateScale(16),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(20),
    },
    roleText: {
      fontSize: moderateScale(12),
      color: "white",
      fontWeight: "500",
    },

    // Cards container
    cardsContainer: {
      padding: moderateScale(15),
      marginTop: moderateScale(5),
    },

    // Card styles
    card: {
      borderRadius: moderateScale(20),
      padding: moderateScale(20),
      marginBottom: moderateScale(14),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: moderateScale(10),
      backgroundColor: "transparent",
    },
    cardTitle: {
      fontSize: moderateScale(18),
      fontWeight: "700",
    },

    // Info row styles
    infoRow: {
      marginBottom: moderateScale(14),
      backgroundColor: "transparent",
    },
    infoRowLast: {
      backgroundColor: "transparent",
    },
    infoLabel: {
      fontSize: moderateScale(12),
      marginBottom: 4,
      fontWeight: "500",
    },
    infoValue: {
      fontSize: moderateScale(14),
      fontWeight: "600",
    },
    infoWithIcon: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },

    // Status dot
    statusDot: {
      width: moderateScale(6),
      height: moderateScale(6),
      borderRadius: moderateScale(2),
      marginRight: moderateScale(6),
    },

    // Loading styles
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      fontSize: moderateScale(16),
      fontWeight: "500",
    },

    // Error styles
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    errorTitle: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 12,
    },
    errorMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    retryButtonText: {
      color: "white",
      fontWeight: "600",
      fontSize: 16,
    },

    // Refresh button
    deleteButtonLarge: {
      backgroundColor: theme.colors.error,
      borderRadius: moderateScale(14),
      padding: moderateScale(14),
      alignItems: "center",
      marginTop: moderateScale(10),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    refreshButtonLarge: {
      backgroundColor: theme.colors.primary,
      borderRadius: moderateScale(14),
      padding: moderateScale(14),
      alignItems: "center",
      marginTop: moderateScale(10),
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    refreshButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    refreshButtonText: {
      color: "white",
      fontSize: moderateScale(14),
      fontWeight: "700",
    },
  });
