import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import LinearGradient from "react-native-linear-gradient";

import { useTheme } from "@/src/context/ThemeContext";
import { usePurchase } from "@/src/context/PurchaseContext";
import { $axiosPrivate } from "@/src/services/AxiosService";
import { Theme } from "@/src/types";
import CreditCardInput from "./components/CreditCardInput";

const ValidationScheme = Yup.object().shape({
  number: Yup.string().required("Karta raqam majburiy"),
  expire: Yup.string().required("Muddati majburiy"),
});

export default function CreditCardScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const { selectedItem, submitPurchase } = usePurchase();
  const [loading, setLoading] = useState(false);

  const { paymentType } = route.params;

  const formatPrice = (price: number) => {
    return price.toLocaleString("uz-UZ") + " so'm";
  };

  const handleSendSms = async (orderId: any) => {
    try {
      const { data } = await $axiosPrivate.post(
        "transactions/subscribe/card/send-sms",
        { orderId }
      );
      setLoading(false);
      navigation.navigate("OTPCardVerification", {
        orderId,
        phoneNumber: data.phone,
      });
      Toast.show({
        type: "success",
        text1: "SMS yuborildi!",
        text2: `Tasdiqlash kodi yuborildi`,
      });
    } catch (error: any) {
      setLoading(false);
      if (error.status === 400) {
        Toast.show({
          type: "error",
          text1: "SMS yuborilgan",
          text2: "SMS allaqachon yuborilgan",
        });
        return;
      }
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "SMS yuborishda xatolik yuz berdi",
      });
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const data = await submitPurchase({
        values: {
          planId: Number(selectedItem?.id),
          paymentType: paymentType.toString(),
          card: {
            expire: values.expire.split("/").join(""),
            number: values.number.split(" ").join(""),
          },
        },
      });
      if (data as any) {
        handleSendSms((data as any).id);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Sotib olishda xatolik yuz berdi!",
      });
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Karta orqali to'lash",
      headerStyle: {
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      },
      headerTintColor: isDark ? "#fff" : "#000",
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation, isDark]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
            <Text style={styles.headerTitle}>Karta orqali to'lash</Text>
            <View style={{ width: 24 }} />
          </View>
          {/* Card Form */}
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <MaterialIcons
                name="credit-card"
                size={22}
                color={isDark ? "#fff" : "#1F2937"}
              />
              <Text style={styles.formTitle}>Karta ma'lumotlari</Text>
            </View>

            <Formik
              initialValues={{ number: "", expire: "" }}
              validationSchema={ValidationScheme}
              onSubmit={handleSubmit}
            >
              {({
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
                submitForm,
              }) => (
                <View style={styles.formContainer}>
                  <CreditCardInput
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    inputStyle={{ color: isDark ? "#fff" : "#000" }}
                  />

                  {/* Security Info */}
                  <View style={styles.securityInfo}>
                    <Ionicons
                      name="shield-checkmark"
                      size={18}
                      color="#10B981"
                    />
                    <Text style={styles.securityText}>
                      Karta ma'lumotlaringiz xavfsiz saqlanadi
                    </Text>
                  </View>

                  {/* Price Breakdown */}
                  <View style={styles.breakdownCard}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>To'lov summasi</Text>
                      <Text style={styles.breakdownValue}>
                        {formatPrice(selectedItem?.price || 0)}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Komissiya</Text>
                      <Text style={styles.breakdownValue}>0 сум</Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Jami to'lov</Text>
                      <Text style={styles.totalValue}>
                        {formatPrice(selectedItem?.price || 0)}
                      </Text>
                    </View>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={submitForm}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#3a5dde", "#5e84e6"]}
                      start={{ x: 0.5, y: 1.0 }}
                      end={{ x: 0.5, y: 0.0 }}
                      style={styles.payButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="lock" size={20} color="#fff" />
                          <Text style={styles.payButtonText}>
                            To'lash • {formatPrice(selectedItem?.price || 0)}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Terms */}
                  <Text style={styles.termsText}>
                    To'lovni amalga oshirish orqali siz foydalanish shartlarimiz
                    bilan roziligingizni bildirasiz
                  </Text>
                </View>
              )}
            </Formik>
          </View>

          {/* Payment Info */}
          {/* <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={20} color="#8B5CF6" />
              <Text style={styles.infoTitle}>To'lov haqida</Text>
            </View>
            <View style={styles.infoPoints}>
              <View style={styles.infoPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.infoPointText}>
                  SMS orqali tasdiqlash kerak bo'ladi
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.infoPointText}>
                  Bank kartangizga bog'liq bo'lgan telefon raqamingizga SMS keladi
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.infoPointText}>
                  To'lov bank darajasida himoyalangan
                </Text>
              </View>
            </View>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0F172A" : "#F9FAFB",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 16,
      paddingBottom: 12,
      marginBottom: 8,
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
    priceCard: {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      marginBottom: 24,
      borderWidth: 2,
      borderColor: "#8B5CF6",
      ...(isDark
        ? {}
        : {
            shadowColor: "#8B5CF6",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }),
    },
    priceIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: "#8B5CF6",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    priceAmount: {
      fontSize: 32,
      fontWeight: "800",
      color: isDark ? "#FFFFFF" : "#1F2937",
      marginBottom: 8,
    },
    priceNote: {
      fontSize: 15,
      color: isDark ? "#94A3B8" : "#6B7280",
      fontWeight: "500",
    },
    formCard: {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      marginBottom: 24,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    formContainer: {
      gap: 20,
    },
    securityInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: isDark
        ? "rgba(16, 185, 129, 0.1)"
        : "rgba(16, 185, 129, 0.05)",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark
        ? "rgba(16, 185, 129, 0.2)"
        : "rgba(16, 185, 129, 0.1)",
    },
    securityText: {
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#6B7280",
      flex: 1,
    },
    breakdownCard: {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.03)",
      borderRadius: 16,
      padding: 16,
    },
    breakdownRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
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
    breakdownDivider: {
      height: 1,
      backgroundColor: isDark ? "#334155" : "#E5E7EB",
      marginVertical: 12,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    totalValue: {
      fontSize: 20,
      fontWeight: "800",
      color: "#5e84e6",
    },
    payButton: {
      borderRadius: 16,
      overflow: "hidden",
    },
    payButtonGradient: {
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    payButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    termsText: {
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#6B7280",
      textAlign: "center",
      lineHeight: 18,
      marginTop: 8,
    },
    infoCard: {
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 20,
      padding: 20,
    },
    infoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    infoTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    infoPoints: {
      gap: 12,
    },
    infoPoint: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    infoPointText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#6B7280",
      lineHeight: 20,
    },
  });
