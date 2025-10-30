import React, { createContext, useContext, useState, ReactNode } from "react";
import { $axiosBase } from "../services/AxiosService";
import DeviceInfo from "react-native-device-info";

export interface RegisterData {
  // Step 1 - Personal Info
  firstName: string;
  lastName: string;
  middleName: string;

  // Step 2 - Contact Info
  phoneNumber: string;
  email: string;

  // Step 3 - Login Credentials
  userName: string;
  password: string;
  confirmPassword: string;
}

export interface OTPData {
  code: string;
  phoneNumber: string;
  countdown: number;
}

interface RegisterContextType {
  // Registration data
  registerData: RegisterData;
  updateRegisterData: (data: Partial<RegisterData>) => void;

  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // OTP management
  otpData: OTPData;
  setOtpData: (data: Partial<OTPData>) => void;

  // Registration process
  submitRegistration: (values: {
    userName: string;
    password: string;
    confirmPassword: string;
  }) => any;
  resetRegistration: () => void;

  // Loading state
  isLoading: boolean;
}

const RegisterContext = createContext<RegisterContextType | undefined>(
  undefined
);

interface RegisterProviderProps {
  children: ReactNode;
}

const initialRegisterData: RegisterData = {
  firstName: "",
  lastName: "",
  middleName: "",
  phoneNumber: "",
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
};

const initialOtpData: OTPData = {
  code: "",
  phoneNumber: "",
  countdown: 0,
};

export const RegisterProvider: React.FC<RegisterProviderProps> = ({
  children,
}) => {
  const [registerData, setRegisterData] =
    useState<RegisterData>(initialRegisterData);
  const [currentStep, setCurrentStep] = useState(1);
  const [otpData, setOtpData] = useState<OTPData>(initialOtpData);
  const [isLoading, setIsLoading] = useState(false);

  const updateRegisterData = async (data: Partial<RegisterData>) => {
    setRegisterData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateOtpData = (data: Partial<OTPData>) => {
    setOtpData((prev) => ({ ...prev, ...data }));
  };

  const submitRegistration = async (values: {
    userName: string;
    password: string;
    confirmPassword: string;
  }) => {
    await $axiosBase.post("account/register", {
      ...registerData,
      ...values,
      uniqueId: (await DeviceInfo.getUniqueId()).toString(),
    });
    updateRegisterData(values);
    setCurrentStep(5);
  };

  const resetRegistration = () => {
    setRegisterData(initialRegisterData);
    setOtpData(initialOtpData);
    setCurrentStep(1);
    setIsLoading(false);
  };

  const value: RegisterContextType = {
    registerData,
    updateRegisterData,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    otpData,
    setOtpData: updateOtpData,
    submitRegistration,
    resetRegistration,
    isLoading,
  };

  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = (): RegisterContextType => {
  const context = useContext(RegisterContext);
  if (context === undefined) {
    throw new Error("useRegister must be used within a RegisterProvider");
  }
  return context;
};
