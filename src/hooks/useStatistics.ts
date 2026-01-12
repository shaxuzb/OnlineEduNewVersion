import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statisticsService";
import {
  ChapterWithThemesStatistic,
  StatisticsResponse,
  ThemeTestStatistic,
} from "../types";

/**
 * Custom hook to fetch subject statistics
 */
export const useStatistics = (userId: number) => {
  return useQuery<StatisticsResponse, Error>({
    queryKey: ["statistics", "subjects"],
    queryFn: () => statisticsService.getSubjectStatistics(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useThemeStatistics = (userId: number, subjectId: number) => {
  return useQuery<ChapterWithThemesStatistic[], Error>({
    queryKey: ["statistics", "subjects", subjectId],
    queryFn: () => statisticsService.getThemeStatistics(userId, subjectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false,
  });
};
export const useThemeTestStatistics = (
  userId: number,
  subjectId: number,
  testId: number
) => {
  return useQuery<ThemeTestStatistic, Error>({
    queryKey: ["statistics", "subjects", subjectId, testId],
    queryFn: () =>
      statisticsService.getTestStatistics(userId, subjectId, testId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: false,
  });
};
