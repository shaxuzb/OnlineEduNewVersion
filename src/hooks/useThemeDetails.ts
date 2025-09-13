import { useQuery } from '@tanstack/react-query';
import { themeDetailService } from '../services/themeDetailsService';

export const themesDetailKeys = {
  themeDetail: (themeId: number) => ['themeDetail', themeId] as const,
};

export function useThemeDetails(themeId: number) {
  return useQuery({
    queryKey: themesDetailKeys.themeDetail(themeId),
    queryFn: () => themeDetailService.getThemeDetail(themeId),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });
}
