import { OrderResponse } from "../types";
import { $axiosPrivate } from "./AxiosService";

export const orderService = {
  // Get all subjects
  getOrders: async (): Promise<OrderResponse> => {
    const response = await $axiosPrivate.get("/purchase-orders");
    return response.data;
  },
};
