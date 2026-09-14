import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statisticsService";
import {
  ChapterWithThemesStatistic,
  StatisticsResponse,
  ThemeTestStatistic,
} from "../types";
import { statisticsKeys } from "./statisticsKeys";

/**
 * Custom hook to fetch subject statistics
 */
export const useStatistics = (userId: number) => {
  return useQuery<StatisticsResponse, Error>({
    queryKey: statisticsKeys.subjects(userId),
    queryFn: () => statisticsService.getSubjectStatistics(userId),
    enabled: Boolean(userId),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useThemeStatistics = (userId: number, subjectId: number) => {
  return useQuery<ChapterWithThemesStatistic[], Error>({
    queryKey: statisticsKeys.themes(userId, subjectId),
    queryFn: () => statisticsService.getThemeStatistics(userId, subjectId),
    enabled: Boolean(userId && subjectId),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
export const useSubjectTestStatistics = (
  userId: number,
  subjectId: number,
  testId: number,
  enabled = true,
) => {
  return useQuery<ThemeTestStatistic, Error>({
    queryKey: statisticsKeys.test(userId, subjectId, testId),
    queryFn: () =>
      statisticsService.getTestStatistics(userId, subjectId, testId),
    enabled: enabled && Boolean(userId && subjectId && testId),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Backward-compatible alias for existing consumers.
export const useThemeTestStatistics = useSubjectTestStatistics;
