import { $axiosPrivate } from "./AxiosService";
import { ChapterWithThemesStatistic, StatisticsResponse, ThemeTestStatistic } from "../types";

export const statisticsService = {
  /**
   * Get subject statistics for the current user
   * @returns Promise<StatisticsResponse> - Array of subject statistics
   */
  getSubjectStatistics: async (userId: number): Promise<StatisticsResponse> => {
    try {
      const response = await $axiosPrivate.get<StatisticsResponse>(
        "/stats/subjects",
        {
          params: {
            userId: userId,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch subject statistics:", error);
      throw error;
    }
  },
  getThemeStatistics: async (
    userId: number,
    subjectId: number
  ): Promise<ChapterWithThemesStatistic[]> => {
    try {
      const { data } = await $axiosPrivate.get(
        `/stats/subject/${subjectId}/chapters`,
        {
          params: {
            userId: userId,
          },
        }
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch subject statistics:", error);
      throw error;
    }
  },
  getTestStatistics: async (
    userId: number,
    subjectId: number,
    testId: number
  ): Promise<ThemeTestStatistic> => {
    try {
      const { data } = await $axiosPrivate.get(
        `stats/subjects/${subjectId}/tests/${testId}`,
        {
          params: {
            userId: userId,
          },
        }
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch subject statistics:", error);
      throw error;
    }
  },
};
