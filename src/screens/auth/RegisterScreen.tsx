import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { RegisterProvider, useRegister } from '../../context/RegisterContext';
import Step1PersonalInfo from './register/Step1PersonalInfo';
import Step2ContactInfo from './register/Step2ContactInfo';
import Step2OTPVerification from './register/Step2OTPVerification';
import Step3LoginCredentials from './register/Step3LoginCredentials';
import SuccessScreen from './register/SuccessScreen';
import { Ionicons } from '@expo/vector-icons';

// Progress indicator component
const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'inactive';
  };

  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const status = getStepStatus(stepNumber);
        
        return (
          <View key={stepNumber} style={styles.progressStep}>
            <View style={[
              styles.progressCircle,
              status === 'completed' && styles.progressCircleCompleted,
              status === 'active' && styles.progressCircleActive,
            ]}>
              {status === 'completed' ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text style={[
                  styles.progressText,
                  status === 'active' && styles.progressTextActive
                ]}>
                  {stepNumber}
                </Text>
              )}
            </View>
            {stepNumber < totalSteps && (
              <View style={[
                styles.progressLine,
                status === 'completed' && styles.progressLineCompleted
              ]} />
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

const RegisterScreenContent: React.FC<RegisterScreenContentProps> = ({ onClose }) => {
  const { currentStep, resetRegistration } = useRegister();

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
        return <Step3LoginCredentials />;
      case 5:
        return <SuccessScreen />;
      default:
        return <Step1PersonalInfo />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header with close button and progress - hide on success screen */}
      {currentStep !== 5 && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          
          <View style={styles.placeholder} />
        </View>
      )}

      {/* Current Step Content */}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  
  // Progress Indicator Styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleActive: {
    backgroundColor: '#3B82F6',
  },
  progressCircleCompleted: {
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressTextActive: {
    color: 'white',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: '#10B981',
  },
});

export default RegisterScreen;
