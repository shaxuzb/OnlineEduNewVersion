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
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../../context/ThemeContext";
import { Theme } from "../../../types";
import { Ionicons } from "@expo/vector-icons";
import { $axiosBase } from "@/src/services/AxiosService";
import { useResetPassword } from "@/src/context/ResetPasswordContext";
import { Formik } from "formik";
import * as Yup from "yup";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";
const Step3Schema = Yup.object().shape({
  code: Yup.string()
    .min(6, "Kod to'liq emas")
    .required("Tasdiqlash kodi majburiy"),
  newPassword: Yup.string()
    .min(8, "Parol kamida 8 ta belgidan iborat bo'lishi kerak")
    // .matches(/[A-Z]/, 'Parol kamida bitta katta harf bo\'lishi kerak')
    // .matches(/[a-z]/, 'Parol kamida bitta kichik harf bo\'lishi kerak')
    // .matches(/[0-9]/, 'Parol kamida bitta raqam bo\'lishi kerak')
    .required("Parol majburiy"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Parollar bir xil emas")
    .required("Parolni takrorlash majburiy"),
});
interface Step2OTPVerificationProps {
  onClose: () => void;
}
const Step2OTPVerification: React.FC<Step2OTPVerificationProps> = ({
  onClose,
}) => {
  const { resetPasswordData, submitResetPassword, prevStep } =
    useResetPassword();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const styles = createStyles(theme);
  const [countdown, setCountdown] = useState(180);
  const [canResend, setCanResend] = useState(false);
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

  const handleSubmit = async (values: {
    code: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      await submitResetPassword({ ...values, code: values.code });
      Toast.show({
        type: "success", // 'success' | 'error' | 'info'
        text1: "Parol o'zgartirildi",
        text2: "Parol muvofoqiyatli o'zgartirildi",
      });
      onClose();
    } catch (error: any) {
      Toast.show({
        type: "error", // 'success' | 'error' | 'info'
        text1: "Xatolik",
        text2: "No'malum hatolik",
      });
      // if (error.status === 409) {
      //   Alert.alert(
      //     "Warning",
      //     "Avval qurilma yoki aloqa nomeridan ro'yhatdan o'tilgan",
      //     [
      //       {
      //         text: "OK",
      //         onPress: () => onClose(),
      //       },
      //     ]
      //   );
      // } else {
      //   console.error("Registration error:", error);
      // }
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);

    try {
      // Simulate resend API call
      await $axiosBase.post("account/password-reset/request", {
        phone: resetPasswordData.phone,
      });

      setCountdown(180);
      setCanResend(false);
      otpRefs.current[0]?.focus();
      Toast.show({
        type: "success", // 'success' | 'error' | 'info'
        text1: "Muvaffaqiyat",
        text2: "Tasdiqlash kodi qayta yuborildi",
      });
    } catch (error) {
      Toast.show({
        type: "error", // 'success' | 'error' | 'info'
        text1: "Xatolik",
        text2: "Kodni qayta yuborishda xatolik yuz berdi",
      });
    } finally {
      setIsResending(false);
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
            <Text style={styles.title}>Parolni ozgartirish</Text>
            <Text style={styles.subtitle}>
              {resetPasswordData.phone} raqamiga yuborilgan SMS kodni kiriting
            </Text>
          </View>

          <Formik
            initialValues={{
              newPassword: resetPasswordData.newPassword,
              code: "",
              confirmPassword: resetPasswordData.confirmPassword,
            }}
            validationSchema={Step3Schema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              values,
              isSubmitting,
              errors,
              touched,
              isValid,
            }) => {
              return (
                <View style={styles.formContainer}>
                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          touched.newPassword &&
                            errors.newPassword &&
                            styles.inputError,
                        ]}
                        placeholder="Parol"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={values.newPassword}
                        onChangeText={handleChange("newPassword")}
                        onBlur={handleBlur("newPassword")}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye" : "eye-off"}
                          size={22}
                          color={theme.colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.newPassword && errors.newPassword && (
                      <Text style={styles.errorText}>{errors.newPassword}</Text>
                    )}
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputContainer}>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={[
                          styles.passwordInput,
                          touched.confirmPassword &&
                            errors.confirmPassword &&
                            styles.inputError,
                        ]}
                        placeholder="Parolni takrorlang"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry={!showPassword}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye" : "eye-off"}
                          size={22}
                          color={theme.colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputContainer}>
                    <View style={styles.otpContainer}>
                      <OtpInput
                        numberOfDigits={6}
                        autoFocus={false}
                        onTextChange={(e) =>
                          setFieldValue("code", e.toString())
                        }
                        onFilled={(e) => setFieldValue("code", e.toString())}
                        theme={{
                          pinCodeContainerStyle: {
                            width: 50,
                            height: 55,
                            
                          },
                          pinCodeTextStyle: {
                            color: theme.colors.text
                          }
                        }}
                      />
                    </View>
                    {touched.code && errors.code && (
                      <Text style={styles.errorText}>{errors.code}</Text>
                    )}
                  </View>
                  {/* Buttons */}

                  {/* Countdown Timer */}
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>
                      {formatTime(countdown)}
                    </Text>
                  </View>

                  {/* Manual Verify Button */}
                  <TouchableOpacity
                    style={[
                      styles.verifyButton,
                      (isSubmitting || !isValid) && styles.verifyButtonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
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
                      <ActivityIndicator
                        color={theme.colors.primary}
                        size="small"
                      />
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
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={[styles.navButton, styles.backButton]}
                      onPress={prevStep}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.backButtonText}>Orqaga</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          </Formik>
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
    formContainer: { width: "100%" },
    inputContainer: { marginBottom: 20 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 12,
      backgroundColor: theme.colors.inputBackground,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
    },
    eyeButton: { paddingHorizontal: 12, paddingVertical: 14 },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.error + "15",
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      marginTop: 6,
      marginLeft: 4,
    },
    submitButton: { backgroundColor: theme.colors.success },
    submitButtonDisabled: { backgroundColor: theme.colors.border },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginRight: 8,
    },
  });

export default Step2OTPVerification;
