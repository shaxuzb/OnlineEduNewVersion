import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/orderService";

export const orderKeys = {
  all: ["orders"] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.all,
    queryFn: orderService.getOrders,
  });
}
