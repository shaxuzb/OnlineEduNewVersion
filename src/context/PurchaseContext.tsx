import React, { createContext, useContext, useState, useCallback } from "react";
import { $axiosPrivate } from "../services/AxiosService";
import { SubscriptionPlanOption } from "../types";
// 🟦 Sotib olishni yuborish funksiyasi (post)
interface SubmitPurchaseProps {
  values: {
    planId: number;
    paymentType: string;
    card?: {
      number: string;
      expire: string;
    };
  };
}
interface PurchaseContextType {
  selectedItem: SubscriptionPlanOption | null;
  submitPurchase: (values: SubmitPurchaseProps) => Promise<void>;
  setSelectedItem: React.Dispatch<React.SetStateAction<SubscriptionPlanOption | null>>;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedItem, setSelectedItem] =
    useState<SubscriptionPlanOption | null>(null);

  // 🟩 Checkout bosilganda

  const submitPurchase = useCallback(
    async ({ values }: SubmitPurchaseProps) => {
      const body = {
        scopeIds: selectedItem?.id,
        ...values,
      };

      const { data } = await $axiosPrivate.post("purchase-orders", body);
      setSelectedItem(null);
      return data;
    },
    [selectedItem]
  );

  return (
    <PurchaseContext.Provider
      value={{
        selectedItem,
        submitPurchase,
        setSelectedItem,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchase = () => {
  const context = useContext(PurchaseContext);
  if (!context)
    throw new Error("usePurchase must be used within PurchaseProvider");
  return context;
};
