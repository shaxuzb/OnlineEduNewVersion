import { $axiosPrivate } from "./AxiosService";

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
};
