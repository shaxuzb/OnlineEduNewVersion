import { $axiosPrivate } from "./AxiosService";
import { StatisticsResponse } from "../types";

export const statisticsService = {
  /**
   * Get subject statistics for the current user
   * @returns Promise<StatisticsResponse> - Array of subject statistics
   */
  getSubjectStatistics: async (): Promise<StatisticsResponse> => {
    try {
      const response = await $axiosPrivate.get<StatisticsResponse>(
        "/stats/subjects"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subject statistics:", error);
      throw error;
    }
  },
};
