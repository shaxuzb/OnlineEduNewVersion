import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";
import { Ionicons } from "@expo/vector-icons";
import Step1NumberInfo from "./resetpassword/Step1NumberInfo";
import {
  ResetPasswordProvider,
  useResetPassword,
} from "@/src/context/ResetPasswordContext";
import Step2OTPVerification from "./resetpassword/Step2OTPVerification";

// Progress indicator component
const ProgressIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
}> = ({ currentStep, totalSteps }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "inactive";
  };

  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const status = getStepStatus(stepNumber);

        return (
          <View key={stepNumber} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                status === "completed" && styles.progressCircleCompleted,
                status === "active" && styles.progressCircleActive,
              ]}
            >
              {status === "completed" ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text
                  style={[
                    styles.progressText,
                    status === "active" && styles.progressTextActive,
                  ]}
                >
                  {stepNumber}
                </Text>
              )}
            </View>
            {stepNumber < totalSteps && (
              <View
                style={[
                  styles.progressLine,
                  status === "completed" && styles.progressLineCompleted,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

// Main register screen content
interface ResetPasswordScreenContentProps {
  onClose?: () => void;
}

const ResetPasswordScreenContent: React.FC<ResetPasswordScreenContentProps> = ({
  onClose,
}) => {
  const { currentStep, resetDatas } = useResetPassword();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleClose = () => {
    resetDatas();
    if (onClose) {
      onClose();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1NumberInfo />;
      case 2:
        return <Step2OTPVerification onClose={handleClose} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header with close button and progress - hide on success screen */}
      {currentStep !== 3 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <ProgressIndicator currentStep={currentStep} totalSteps={2} />

          <View style={styles.placeholder} />
        </View>
      )}

      {/* Current Step Content */}
      <View style={styles.content}>{renderCurrentStep()}</View>
    </SafeAreaView>
  );
};

// Main component with provider
interface ResetPasswordScreenProps {
  onClose?: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  onClose,
}) => {
  return (
    <ResetPasswordProvider>
      <ResetPasswordScreenContent onClose={onClose} />
    </ResetPasswordProvider>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },

    // Progress Indicator Styles
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    progressStep: {
      flexDirection: "row",
      alignItems: "center",
    },
    progressCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    progressCircleActive: {
      backgroundColor: theme.colors.primary,
    },
    progressCircleCompleted: {
      backgroundColor: theme.colors.success,
    },
    progressText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textMuted,
    },
    progressTextActive: {
      color: "white",
    },
    progressLine: {
      width: 40,
      height: 2,
      backgroundColor: theme.colors.border,
      marginHorizontal: 8,
    },
    progressLineCompleted: {
      backgroundColor: theme.colors.success,
    },
  });

export default ResetPasswordScreen;
