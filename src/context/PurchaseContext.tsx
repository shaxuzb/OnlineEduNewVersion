import React, { createContext, useCallback, useContext, useState } from "react";
import { SubscriptionPlanOption } from "../types";
import { purchaseService } from "../services/purchaseService";
import {
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
} from "../services/purchaseTypes";

interface SubmitPurchaseProps {
  values: Omit<CreatePurchaseOrderRequest, "scopeIds">;
}

interface PurchaseContextType {
  selectedItem: SubscriptionPlanOption | null;
  submitPurchase: (
    values: SubmitPurchaseProps,
  ) => Promise<PurchaseOrderResponse>;
  setSelectedItem: React.Dispatch<
    React.SetStateAction<SubscriptionPlanOption | null>
  >;
}

const PurchaseContext = createContext<PurchaseContextType | null>(null);

export const PurchaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedItem, setSelectedItem] =
    useState<SubscriptionPlanOption | null>(null);

  const submitPurchase = useCallback(
    async ({ values }: SubmitPurchaseProps): Promise<PurchaseOrderResponse> => {
      if (!selectedItem) {
        throw new Error("Purchase plan is not selected");
      }

      const body: CreatePurchaseOrderRequest = {
        scopeIds: selectedItem.id,
        ...values,
      };

      const data = await purchaseService.createOrder(body);
      setSelectedItem(null);
      return data;
    },
    [selectedItem],
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
  if (!context) {
    throw new Error("usePurchase must be used within PurchaseProvider");
  }
  return context;
};
