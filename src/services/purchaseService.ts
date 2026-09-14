import { $axiosPrivate } from "./AxiosService";
import { getRecoverableCardSmsResponse } from "./cardSmsRecovery";
import { createSingleFlight } from "./singleFlight";
import {
  CardSmsResponse,
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
} from "./purchaseTypes";

const verifyCardPaymentSingleFlight = createSingleFlight<void>();

export const purchaseService = {
  getAll: async () => {
    const { data } = await $axiosPrivate.get(
      "subscription-plan/grouped-by-tier",
    );
    return data;
  },

  getById: async (id: number) => {
    const { data } = await $axiosPrivate.get(
      `subscription-plan/grouped-by-tier/${id}`,
    );
    return data;
  },

  createOrder: async (
    body: CreatePurchaseOrderRequest,
  ): Promise<PurchaseOrderResponse> => {
    const { data } = await $axiosPrivate.post("purchase-orders", body);
    return data;
  },

  sendCardSms: async (orderId: number): Promise<CardSmsResponse> => {
    try {
      const { data } = await $axiosPrivate.post(
        "transactions/subscribe/card/send-sms",
        { orderId },
      );
      return data;
    } catch (error) {
      const recovery = getRecoverableCardSmsResponse(error);
      if (recovery) return recovery;
      throw error;
    }
  },

  resendCardSms: async (orderId: number): Promise<void> => {
    try {
      await $axiosPrivate.post("transactions/subscribe/card/send-sms", {
        orderId,
      });
    } catch (error) {
      if (getRecoverableCardSmsResponse(error)) return;
      throw error;
    }
  },

  verifyCardPayment: (orderId: number, code: string): Promise<void> =>
    verifyCardPaymentSingleFlight(`${orderId}:${code}`, async () => {
      await $axiosPrivate.post("transactions/subscribe/card/pay", {
        orderId,
        code,
      });
    }),
};
