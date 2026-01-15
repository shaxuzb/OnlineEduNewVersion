import { useQuery } from "@tanstack/react-query";
import { SubscriptionPlan, ThemesByChapterResponse } from "../types";
import { purchaseService } from "../services/purchaseService";

export const purchaseKeys = {
  all: ["purchases"] as const,
  byId: (subjectId: number) => [...purchaseKeys.all, subjectId] as const,
};

export function usePurchases() {
  return useQuery<SubscriptionPlan[]>({
    queryKey: purchaseKeys.all,
    queryFn: () => purchaseService.getAll(),
  });
}
export function usePurchaseById(id: number) {
  return useQuery<SubscriptionPlan>({
    queryKey: purchaseKeys.byId(id),
    queryFn: () => purchaseService.getById(id),
  });
}
