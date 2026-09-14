import { useQuery } from "@tanstack/react-query";
import { paymentNotificationCountKey } from "../services/paymentNotificationUtils";

export const usePaymentNotificationCount = () =>
  useQuery<number>({
    queryKey: paymentNotificationCountKey,
    queryFn: async () => 0,
    initialData: 0,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
