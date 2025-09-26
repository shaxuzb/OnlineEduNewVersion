import { $axiosPrivate } from "./AxiosService";
import { StatisticsResponse, ChapterStatisticsResponse } from "../types";

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

  /**
   * Get chapter statistics for a specific subject
   * @param subjectId - The ID of the subject to get chapter statistics for
   * @returns Promise<ChapterStatisticsResponse> - Array of chapter statistics with themes
   */
  getChapterStatistics: async (
    subjectId: number
  ): Promise<ChapterStatisticsResponse> => {
    try {
      const response = await $axiosPrivate.get<ChapterStatisticsResponse>(
        `/stats/subject/${subjectId}/chapters`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Failed to fetch chapter statistics for subject ${subjectId}:`,
        error
      );
      throw error;
    }
  },
};
