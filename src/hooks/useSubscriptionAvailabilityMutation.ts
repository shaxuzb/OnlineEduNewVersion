import { useMutation } from "@tanstack/react-query";
import { $axiosPrivate } from "../services/AxiosService";

type Reason = {
  uz: string;
  ru: string;
  en: string;
};

type AvailabilityResponse = {
  isAvailable: boolean;
  reason?: Reason;
};

export const useSubscriptionAvailabilityMutation = () => {
  return useMutation<AvailabilityResponse, any, number>({
    mutationFn: async (id: number) => {
      const { data } = await $axiosPrivate.get(
        `/subscription-plan/availability/${id}`,
      );
      return data;
    },

    onError: (error: any) => {
      console.log("Availability error:", error?.response?.data);
    },
  });
};
