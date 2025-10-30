import React from "react";
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
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTheme } from "../../../context/ThemeContext";
import { Theme } from "../../../types";
import { Ionicons } from "@expo/vector-icons";
import { $axiosPrivate } from "@/src/services/AxiosService";
import { useResetPassword } from "@/src/context/ResetPasswordContext";

const phoneRegex = /^\+998\d{9}$/;

const Step2Schema = Yup.object().shape({
  phone: Yup.string()
    .matches(phoneRegex, "Telefon raqam formati: +998XXXXXXXXX")
    .required("Telefon raqam majburiy"),
});

const Step1NumberInfo: React.FC = () => {
  const { resetPasswordData, updateResetPasswordData, nextStep } =
    useResetPassword();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleNext = async (values: { phone: string }) => {
    try {
      updateResetPasswordData({
        phone: values.phone,
      });
      await $axiosPrivate.post(`account/password-reset/request`, {
        phone: values.phone,
      });
      nextStep();
      Alert.alert(
        "SMS yuborildi!",
        `${values.phone} raqamiga tasdiqlash kodi yuborildi`
      );
      // Show SMS sending confirmation
    } catch (error: any) {
      if (error.status === 400) {
        Alert.alert("SMS yuborilgan", error.response.data.message);
      }
      Alert.alert("Xatolik", "SMS yuborishda xatolik yuz berdi");
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
            <Text style={styles.title}>Parolni o'zgartrish</Text>
            <Text style={styles.subtitle}>Kontakt ma'lumotlarini kiriting</Text>
          </View>
          <Formik
            initialValues={{
              phone: resetPasswordData.phone || "+998",
            }}
            validationSchema={Step2Schema}
            onSubmit={handleNext}
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
                {/* Phone */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Telefon raqam</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.phone && errors.phone && styles.inputError,
                    ]}
                    placeholder="+998XXXXXXXXX"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="phone-pad"
                    value={values.phone}
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>
                {/* Buttons */}
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.navButton,
                      styles.nextButton,
                      !isValid && styles.nextButtonDisabled,
                    ]}
                    onPress={() => handleSubmit()}
                    disabled={!isValid}
                  >
                    <Text style={styles.nextButtonText}>Keyingi</Text>
                    <Ionicons name="chevron-forward" size={20} color="white" />
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
    label: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 8 },
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
      justifyContent: "center",
      marginTop: 10,
    },
    navButton: {
      flexDirection: "row",
      justifyContent: "center",
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
    nextButton: { backgroundColor: theme.colors.primary },
    nextButtonDisabled: { backgroundColor: theme.colors.border },
    nextButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginRight: 8,
    },
  });

export default Step1NumberInfo;
