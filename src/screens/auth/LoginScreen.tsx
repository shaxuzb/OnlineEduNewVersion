import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";
import RegisterScreen from "./RegisterScreen";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const { login, isLoginLoading } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Xatolik", "Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    const success = await login(email, password);
    if (!success) {
      Alert.alert("Xatolik", "Login yoki parol noto'g'ri");
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
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MATH</Text>
            <Text style={styles.logoSubtext}>me</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Login</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email kiriting"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoginLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Parol</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Parol kiriting"
                placeholderTextColor={theme.colors.placeholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoginLoading}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoginLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Kirish</Text>
              )}
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>
                Parolni unutdingizmi?
              </Text>
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerContainer}
              onPress={() => setShowRegister(true)}
            >
              <Text style={styles.registerText}>Ro'yxatdan o'tish</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Register Modal */}
      <Modal
        visible={showRegister}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowRegister(false)}
      >
        <RegisterScreen onClose={() => setShowRegister(false)} />
      </Modal>
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
    logoContainer: {
      alignItems: "center",
      marginBottom: 60,
    },
    logoText: {
      fontSize: 48,
      fontWeight: "bold",
      color: theme.colors.primary,
      letterSpacing: -1,
    },
    logoSubtext: {
      fontSize: 24,
      fontWeight: "300",
      color: theme.colors.primary,
      marginTop: -8,
      fontStyle: "italic",
    },
    formContainer: {
      width: "100%",
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
      fontWeight: "500",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
    },
    loginButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 20,
      marginBottom: 16,
    },
    loginButtonDisabled: {
      backgroundColor: theme.colors.primaryLight,
    },
    loginButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    forgotPasswordContainer: {
      alignItems: "center",
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: 14,
      textDecorationLine: "underline",
    },
    registerContainer: {
      alignItems: "center",
      marginTop: 10,
    },
    registerText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "500",
    },
  });

export default LoginScreen;
