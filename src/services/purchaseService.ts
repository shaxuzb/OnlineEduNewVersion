import { $axiosPrivate } from "./AxiosService";
import {
  CardSmsResponse,
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
} from "./purchaseTypes";

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
    const { data } = await $axiosPrivate.post(
      "transactions/subscribe/card/send-sms",
      { orderId },
    );
    return data;
  },

  resendCardSms: async (orderId: number): Promise<void> => {
    await $axiosPrivate.post("transactions/subscribe/card/send-sms", {
      orderId,
    });
  },

  verifyCardPayment: async (orderId: number, code: string): Promise<void> => {
    await $axiosPrivate.post("transactions/subscribe/card/pay", {
      orderId,
      code,
    });
  },
};
