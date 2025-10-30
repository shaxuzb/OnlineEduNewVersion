import React, { createContext, useContext, useState, ReactNode } from "react";
import { $axiosBase } from "../services/AxiosService";

export interface ResetPassword {
  phone: string;
  newPassword: string;
  confirmPassword: string;
  code: string;
}

interface ResetPasswordContextType {
  // Registration data
  resetPasswordData: ResetPassword;
  updateResetPasswordData: (data: Partial<ResetPassword>) => void;

  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Registration process
  submitResetPassword: (values: {
    newPassword: string;
    confirmPassword: string;
    code: string;
  }) => any;
  resetDatas: () => void;

  // Loading state
  isLoading: boolean;
}

const ResetPasswordContext = createContext<
  ResetPasswordContextType | undefined
>(undefined);

interface RegisterProviderProps {
  children: ReactNode;
}

const initialResetPasswordData: ResetPassword = {
  phone: "",
  newPassword: "",
  code: "",
  confirmPassword: "",
};

export const ResetPasswordProvider: React.FC<RegisterProviderProps> = ({
  children,
}) => {
  const [resetPasswordData, setResetPasswordData] = useState<ResetPassword>(
    initialResetPasswordData
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const updateResetPasswordData = async (data: Partial<ResetPassword>) => {
    setResetPasswordData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitResetPassword = async (values: {
    newPassword: string;
    confirmPassword: string;
    code: string;
  }) => {
    await $axiosBase.post("account/password-reset/confirm", {
      ...resetPasswordData,
      ...values,
    });
    updateResetPasswordData(values);
  };

  const resetDatas = () => {
    setResetPasswordData(initialResetPasswordData);
    setCurrentStep(1);
    setIsLoading(false);
  };

  const value: ResetPasswordContextType = {
    resetPasswordData,
    updateResetPasswordData,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    submitResetPassword,
    resetDatas,
    isLoading,
  };

  return (
    <ResetPasswordContext.Provider value={value}>
      {children}
    </ResetPasswordContext.Provider>
  );
};

export const useResetPassword = (): ResetPasswordContextType => {
  const context = useContext(ResetPasswordContext);
  if (context === undefined) {
    throw new Error("useRegister must be used within a RegisterProvider");
  }
  return context;
};
