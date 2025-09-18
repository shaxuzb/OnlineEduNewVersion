import { useQuery } from "@tanstack/react-query";
import { statisticsService } from "../services/statisticsService";
import { StatisticsResponse } from "../types";

/**
 * Custom hook to fetch subject statistics
 */
export const useStatistics = () => {
  return useQuery<StatisticsResponse, Error>({
    queryKey: ["statistics", "subjects"],
    queryFn: statisticsService.getSubjectStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
