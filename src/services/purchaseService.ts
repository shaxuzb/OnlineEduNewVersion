import { $axiosBase, $axiosPrivate } from "./AxiosService";

export const purchaseService = {
  // Get all subjects
  getAll: async () => {
    const { data } = await $axiosPrivate.get(
      "subscription-plan/grouped-by-tier"
    );
    return data;
  },
  getById: async (id: number) => {
    const { data } = await $axiosPrivate.get(
      `subscription-plan/grouped-by-tier/${id}`
    );
    return data;
  },
  createOrder: async (body: unknown) => {
    const { data } = await $axiosPrivate.post("purchase-orders", body);
    return data;
  },
  sendCardSms: async (orderId: number) => {
    const { data } = await $axiosPrivate.post(
      "transactions/subscribe/card/send-sms",
      { orderId },
    );
    return data;
  },
  resendCardSms: async (orderId: number) => {
    await $axiosBase.post("transactions/subscribe/card/send-sms", { orderId });
  },
  verifyCardPayment: async (orderId: number, code: string) => {
    await $axiosPrivate.post("transactions/subscribe/card/pay", {
      orderId,
      code,
    });
  },
};
