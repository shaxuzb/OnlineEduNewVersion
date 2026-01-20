import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { RegisterProvider, useRegister } from "../../context/RegisterContext";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";
import Step1PersonalInfo from "./register/Step1PersonalInfo";
import Step2ContactInfo from "./register/Step2ContactInfo";
import Step2OTPVerification from "./register/Step2OTPVerification";
import Step3LoginCredentials from "./register/Step3LoginCredentials";
import SuccessScreen from "./register/SuccessScreen";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

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
interface RegisterScreenContentProps {
  onClose?: () => void;
}

const RegisterScreenContent: React.FC<RegisterScreenContentProps> = ({
  onClose,
}) => {
  const { currentStep, resetRegistration } = useRegister();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleClose = () => {
    resetRegistration();
    if (onClose) {
      onClose();
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo />;
      case 2:
        return <Step2ContactInfo />;
      case 3:
        return <Step2OTPVerification />;
      case 4:
        return <Step3LoginCredentials onClose={handleClose} />;
      case 5:
        return <SuccessScreen />;
      default:
        return <Step1PersonalInfo />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     

      {/* Header with close button and progress - hide on success screen */}
      {currentStep !== 5 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <ProgressIndicator currentStep={currentStep} totalSteps={4} />

          <View style={styles.placeholder} />
        </View>
      )}

      {/* Current Step Content */}
      <View style={styles.content}>{renderCurrentStep()}</View>
    </SafeAreaView>
  );
};

// Main component with provider
interface RegisterScreenProps {
  onClose?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onClose }) => {
  return (
    <RegisterProvider>
      <RegisterScreenContent onClose={onClose} />
    </RegisterProvider>
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

export default RegisterScreen;
