import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { useTheme } from "@/src/context/ThemeContext";
import { $axiosBase, $axiosPrivate } from "@/src/services/AxiosService";
import getQueryClient from "@/src/utils/helpers/queryClient";
import { Theme } from "@/src/types";
import { useAuth } from "@/src/context/AuthContext";

const OTPCardVerification = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  const queries = getQueryClient();
  const { refetchPlan } = useAuth();
  const { phoneNumber, orderId } = route.params;
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, "");

    const newOtpCode = [...otpCode];
    newOtpCode[index] = numericValue;
    setOtpCode(newOtpCode);

    if (numericValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = newOtpCode.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setIsVerifying(true);
    try {
      await $axiosPrivate.post(`transactions/subscribe/card/pay`, {
        orderId: orderId,
        code,
      });
      queries.clear();

      Toast.show({
        type: "success",
        text1: "Muvaffaqiyatli!",
        text2: "To'lov amalga oshirildi",
      });

      // Success screenga o'tish
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
      refetchPlan();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "Kodni tasdiqlashda xatolik yuz berdi",
      });
      setOtpCode(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await $axiosBase.post("transactions/subscribe/card/send-sms", {
        orderId: orderId,
      });

      setCountdown(60);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();

      Toast.show({
        type: "success",
        text1: "SMS yuborildi!",
        text2: `Tasdiqlash kodi yuborildi`,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "SMS yuborishda xatolik yuz berdi",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleManualVerify = () => {
    const fullCode = otpCode.join("");
    if (fullCode.length === 6) {
      handleVerifyOtp(fullCode);
    } else {
      Toast.show({
        type: "error",
        text1: "Xatolik",
        text2: "6 raqamli kodni to'liq kiriting",
      });
    }
  };

  const maskedPhone = phoneNumber
    ? phoneNumber.replace(/(\d{3})(\d{2})(\d{3})(\d{2})/, "$1 ** *** $4")
    : "**********";
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      statusBarStyle: !isDark ? "dark" : "light",
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
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
        <Text style={styles.headerTitle}>SMS tasdiqlash</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={["#3a5dde", "#5e84e6"]}
                start={{ x: 0.5, y: 1.0 }}
                end={{ x: 0.5, y: 0.0 }}
                style={styles.iconGradient}
              >
                <Ionicons name="phone-portrait" size={32} color="#fff" />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.title}>SMS tasdiqlash</Text>
            <Text style={styles.subtitle}>
              {maskedPhone} raqamiga yuborilgan SMS kodni kiriting
            </Text>

            {/* OTP Inputs */}
            <View style={styles.otpSection}>
              <View style={styles.otpContainer}>
                {otpCode.map((digit, index) => (
                  <View key={index} style={styles.otpCellContainer}>
                    <TextInput
                      ref={(ref) => {
                        otpRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        isVerifying && styles.otpInputDisabled,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={({ nativeEvent }) =>
                        handleKeyPress(nativeEvent.key, index)
                      }
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      editable={!isVerifying}
                      selectTextOnFocus
                    />
                    {index < 5 && <View style={styles.otpDivider} />}
                  </View>
                ))}
              </View>

              {/* Auto fill indicator */}
              {isVerifying ? (
                <View style={styles.verifyingContainer}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={styles.verifyingText}>Tekshirilmoqda...</Text>
                </View>
              ) : (
                <Text style={styles.otpHint}>
                  Kod avtomatik ravishda to'ldiriladi
                </Text>
              )}
            </View>

            {/* Countdown */}
            <View style={styles.timerCard}>
              <View style={styles.timerIcon}>
                <MaterialIcons name="timer" size={20} color="#5e84e6" />
              </View>
              <View style={styles.timerContent}>
                <Text style={styles.timerLabel}>
                  Kodning amal qilish muddati
                </Text>
                <Text style={styles.timerText}>{formatTime(countdown)}</Text>
              </View>
            </View>

            {/* Verify Button */}
            <LinearGradient
              colors={
                otpCode.join("").length === 6 && !isVerifying
                  ? ["#3a5dde", "#5e84e6"]
                  : ["#94A3B8", "#64748B"]
              }
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={styles.verifyButtonGradient}
            >
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  (isVerifying || otpCode.join("").length !== 6) &&
                    styles.verifyButtonDisabled,
                ]}
                onPress={handleManualVerify}
                disabled={isVerifying || otpCode.join("").length !== 6}
                activeOpacity={0.9}
              >
                {isVerifying ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.verifyButtonText}>Tasdiqlash</Text>
                  </>
                )}
              </TouchableOpacity>
            </LinearGradient>

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendHint}>SMS kelmadimi?</Text>
              <TouchableOpacity
                onPress={handleResendCode}
                disabled={!canResend || isResending}
                style={styles.resendButton}
              >
                {isResending ? (
                  <ActivityIndicator color="#8B5CF6" size="small" />
                ) : (
                  <Text
                    style={[
                      styles.resendText,
                      canResend && styles.resendTextActive,
                    ]}
                  >
                    Kodni qayta yuborish
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Ionicons name="information-circle" size={20} color="#94A3B8" />
              </View>
              <Text style={styles.infoText}>
                SMS kodi 5 daqiqa davomida amal qiladi. Agar kod kelmasa, "Kodni
                qayta yuborish" tugmasini bosing.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0F172A" : "#F9FAFB",
    },
    scrollContainer: {
      flexGrow: 1,
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
      fontSize: 18,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
    },
    content: {
      paddingHorizontal: 24,
      paddingTop: 24,
    },
    iconContainer: {
      alignItems: "center",
      marginBottom: 24,
    },
    iconGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      ...(isDark
        ? {}
        : {
            shadowColor: "#5e84e6",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }),
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#1F2937",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? "#94A3B8" : "#6B7280",
      textAlign: "center",
      lineHeight: 24,
      marginBottom: 40,
    },
    otpSection: {
      marginBottom: 32,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    otpCellContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    otpInput: {
      width: 48,
      height: 56,
      borderWidth: 2,
      borderColor: isDark ? "#475569" : "#E5E7EB",
      borderRadius: 12,
      fontSize: 24,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#1F2937",
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
    },
    otpInputFilled: {
      borderColor: "#5e84e6",
      backgroundColor: isDark ? "#5e84e611" : "#5e84e621",
    },
    otpInputDisabled: {
      opacity: 0.6,
    },
    otpDivider: {
      width: 12,
    },
    otpHint: {
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#6B7280",
      textAlign: "center",
      fontStyle: "italic",
    },
    verifyingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    verifyingText: {
      fontSize: 14,
      color: "#8B5CF6",
    },
    timerCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#E5E7EB",
    },
    timerIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? "#5e84e611" : "#5e84e622",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    timerContent: {
      flex: 1,
    },
    timerLabel: {
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#6B7280",
      marginBottom: 4,
    },
    timerText: {
      fontSize: 24,
      fontWeight: "700",
      color: "#5e84e6",
    },
    verifyButton: {
      overflow: "hidden",
      paddingVertical: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    verifyButtonDisabled: {
      opacity: 0.6,
    },
    verifyButtonGradient: {
      borderRadius: 16,
      marginBottom: 24,
    },
    verifyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#FFFFFF",
    },
    resendContainer: {
      alignItems: "center",
      marginBottom: 32,
    },
    resendHint: {
      fontSize: 14,
      color: isDark ? "#94A3B8" : "#6B7280",
      marginBottom: 8,
    },
    resendButton: {
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    resendText: {
      fontSize: 15,
      color: isDark ? "#64748B" : "#9CA3AF",
      fontWeight: "500",
    },
    resendTextActive: {
      color: "#5e84e6",
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: isDark
        ? "rgba(148, 163, 184, 0.1)"
        : "rgba(229, 231, 235, 0.5)",
      borderRadius: 12,
      padding: 16,
    },
    infoIcon: {
      marginRight: 12,
      marginTop: 2,
    },
    infoText: {
      flex: 1,
      fontSize: 13,
      color: isDark ? "#94A3B8" : "#6B7280",
      lineHeight: 18,
    },
  });

export default OTPCardVerification;
