import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { $axiosPrivate } from "../services/AxiosService";
// 🟦 Sotib olishni yuborish funksiyasi (post)
interface SubmitPurchaseProps {
  values: {
    scopeTypeId: number;
    paymentType: string;
    card?: {
      number: string;
      expire: string;
    };
  };
}
interface PurchaseContextType {
  selectedItems: any[];
  selectAll: boolean;
  submitPurchase: (values: SubmitPurchaseProps) => Promise<void>;
  setSelectAll: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigation = useNavigation<any>();

  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 🟩 Checkout bosilganda

  const submitPurchase = useCallback(
    async ({ values }: SubmitPurchaseProps) => {
      const body = {
        scopeIds: selectedItems.map((item) => item.id),
        ...values,
      };

      const { data } = await $axiosPrivate.post("purchase-orders", body);
      setSelectedItems([]);
      setSelectAll(false);
      return data;
    },
    [selectedItems]
  );

  return (
    <PurchaseContext.Provider
      value={{
        selectedItems,
        selectAll,
        submitPurchase,
        setSelectedItems,
        setSelectAll,
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
