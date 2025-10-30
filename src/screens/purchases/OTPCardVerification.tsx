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
import { $axiosBase } from "@/src/services/AxiosService";
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { queryClient } from "@/src/utils/helpers/queryClient";

const OTPCardVerification: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const route = useRoute<any>();
  const { phoneNumber, orderId } = route.params as any;
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Refs for OTP inputs
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown
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
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, "");

    const newOtpCode = [...otpCode];
    newOtpCode[index] = numericValue;
    setOtpCode(newOtpCode);

    // Auto focus next input
    if (numericValue && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto verify when all fields are filled
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
      // Simulate OTP verification API call
      const { data } = await $axiosBase.post(
        `transactions/subscribe/card/pay`,
        {
          orderId: orderId,
          code,
        }
      );
      queryClient.clear();
      (navigation as any).navigate("MainTabs", {
        screen: "Courses",
        params: { screen: "CoursesList" },
      });
      Toast.show({
        type: "success", // 'success' | 'error' | 'info'
        text1: "Movofoqiyatli",
        text2: `To'lov qilindi`,
      });
    } catch (error: any) {
      console.log(error.response);

      Toast.show({
        type: "error", // 'success' | 'error' | 'info'
        text1: "Xatolik",
        text2: `Kodni tasdiqlashda xatolik yuz berdi`,
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
      // Simulate resend API call
      await $axiosBase.post("transactions/subscribe/card/send-sms", {
        orderId: orderId,
      });

      // Reset countdown and OTP
      setCountdown(60);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();

      Toast.show({
        type: "success", // 'success' | 'error' | 'info'
        text1: "SMS yuborildi!",
        text2: `Tasdiqlash kodi yuborildi`,
      });
    } catch (error) {
      Toast.show({
        type: "error", // 'success' | 'error' | 'info'
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
        type: "error", // 'success' | 'error' | 'info'
        text1: "Xatolik",
        text2: "6 raqamli kodni to'liq kiriting",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>SMS yuborildi</Text>
            <Text style={styles.subtitle}>
              {phoneNumber} raqamiga yuborilgan SMS kodni kiriting
            </Text>
          </View>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otpCode.map((digit, index) => (
              <TextInput
                key={index}
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
            ))}
          </View>

          {/* Countdown Timer */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatTime(countdown)}</Text>
          </View>

          {/* Manual Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isVerifying || otpCode.join("").length !== 6) &&
                styles.verifyButtonDisabled,
            ]}
            onPress={handleManualVerify}
            disabled={isVerifying || otpCode.join("").length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Tasdiqlash</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              !canResend && styles.resendButtonDisabled,
            ]}
            onPress={handleResendCode}
            disabled={!canResend || isResending}
          >
            {isResending ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
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

          {/* Navigation Buttons */}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: "center",
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 50,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    otpContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
      paddingHorizontal: 10,
    },
    otpInput: {
      width: 50,
      height: 60,
      borderWidth: 2,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      backgroundColor: theme.colors.inputBackground,
    },
    otpInputFilled: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "15",
    },
    otpInputDisabled: {
      opacity: 0.6,
    },
    timerContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    timerText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    verifyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 20,
    },
    verifyButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    verifyButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    resendButton: {
      alignItems: "center",
      paddingVertical: 12,
      marginBottom: 30,
    },
    resendButtonDisabled: {
      opacity: 0.5,
    },
    resendText: {
      fontSize: 16,
      color: theme.colors.textMuted,
    },
    resendTextActive: {
      color: theme.colors.primary,
      textDecorationLine: "underline",
    },
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    backButton: {
      backgroundColor: theme.colors.primary + "15",
      borderColor: theme.colors.primary + "50",
      borderWidth: 1,
    },
    backButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 4,
    },
    skipButton: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    skipButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: "600",
      marginRight: 4,
    },
  });

export default OTPCardVerification;
