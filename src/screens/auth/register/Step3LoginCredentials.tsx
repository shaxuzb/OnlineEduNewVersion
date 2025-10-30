import React, { useState } from "react";
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
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useRegister } from "../../../context/RegisterContext";
import { useTheme } from "../../../context/ThemeContext";
import { Theme } from "../../../types";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const Step3Schema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Login kamida 3 ta belgidan iborat bo'lishi kerak")
    .max(20, "Login 20 ta belgidan oshmasligi kerak")
    .matches(
      /^[a-zA-Z0-9_]+$/,
      "Login faqat harflar, raqamlar va _ belgilaridan iborat bo'lishi kerak"
    )
    .required("Login majburiy"),
  password: Yup.string()
    .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
    // .matches(/[A-Z]/, 'Parol kamida bitta katta harf bo\'lishi kerak')
    // .matches(/[a-z]/, 'Parol kamida bitta kichik harf bo\'lishi kerak')
    // .matches(/[0-9]/, 'Parol kamida bitta raqam bo\'lishi kerak')
    .required("Parol majburiy"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Parollar bir xil emas")
    .required("Parolni takrorlash majburiy"),
});
interface Step3LoginCredentialsProps {
  onClose: () => void;
}
const Step3LoginCredentials: React.FC<Step3LoginCredentialsProps> = ({
  onClose,
}) => {
  const { registerData, prevStep, submitRegistration, isLoading } =
    useRegister();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (values: {
    userName: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await submitRegistration(values);
    } catch (error: any) {
      console.log(JSON.stringify(error.response));

      if (error.status === 409) {
        onClose();
        Toast.show({
          type: "error",
          text1: "Warning",
          text2: "Avval qurilma yoki aloqa nomeridan ro'yhatdan o'tilgan",
        });
      } else {
        console.error("Registration error:", error);
      }
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
            <Text style={styles.title}>Ro'yxatdan o'tish</Text>
            <Text style={styles.subtitle}>Login va parol o'ylab toping</Text>
          </View>

          <Formik
            initialValues={{
              userName: registerData.userName,
              password: registerData.password,
              confirmPassword: registerData.confirmPassword,
            }}
            validationSchema={Step3Schema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
            }) => (
              <View style={styles.formContainer}>
                {/* Login */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      touched.userName && errors.userName && styles.inputError,
                    ]}
                    placeholder="Login"
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.userName}
                    onChangeText={handleChange("userName")}
                    onBlur={handleBlur("userName")}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.userName && errors.userName && (
                    <Text style={styles.errorText}>{errors.userName}</Text>
                  )}
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={[
                        styles.passwordInput,
                        touched.password &&
                          errors.password &&
                          styles.inputError,
                      ]}
                      placeholder="Parol"
                      placeholderTextColor={theme.colors.textMuted}
                      secureTextEntry={!showPassword}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
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
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
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
                      secureTextEntry={!showConfirmPassword}
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye" : "eye-off"}
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

                {/* Buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.navButton, styles.backButton]}
                    onPress={prevStep}
                    disabled={isLoading}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.backButtonText}>Orqaga</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      styles.submitButton,
                      (!isValid || isLoading) && styles.submitButtonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={!isValid || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Yakunlash</Text>
                        <Ionicons name="checkmark" size={20} color="white" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContainer: { flexGrow: 1, justifyContent: "center" },
    content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
    header: { alignItems: "center", marginBottom: 40 },
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
      lineHeight: 22,
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
    buttonsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
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
    submitButton: { backgroundColor: theme.colors.success },
    submitButtonDisabled: { backgroundColor: theme.colors.border },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginRight: 8,
    },
  });

export default Step3LoginCredentials;
