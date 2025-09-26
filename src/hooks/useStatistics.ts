import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statisticsService";
import { StatisticsResponse, ChapterStatisticsResponse } from "../types";

// Query keys for statistics
export const statisticsKeys = {
  subjects: ["statistics", "subjects"] as const,
  chapters: (subjectId: number) =>
    ["statistics", "chapters", subjectId] as const,
};

/**
 * Custom hook to fetch subject statistics
 */
export const useStatistics = () => {
  return useQuery<StatisticsResponse, Error>({
    queryKey: statisticsKeys.subjects,
    queryFn: statisticsService.getSubjectStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook to fetch chapter statistics for a specific subject
 */
export const useChapterStatistics = (subjectId: number) => {
  return useQuery<ChapterStatisticsResponse, Error>({
    queryKey: statisticsKeys.chapters(subjectId),
    queryFn: () => statisticsService.getChapterStatistics(subjectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!subjectId, // Only run if subjectId is provided
  });
};
