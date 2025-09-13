import { useQuery } from '@tanstack/react-query';
import { themesService } from '../services/themesService';
import { ThemesByChapterResponse } from '../types';

export const themesKeys = {
  all: ['themes'] as const,
  bySubject: (subjectId: number) => [...themesKeys.all, 'subject', subjectId] as const,
};

export function useThemes(subjectId: number) {
  return useQuery<ThemesByChapterResponse>({
    queryKey: themesKeys.bySubject(subjectId),
    queryFn: () => themesService.getThemesBySubject(subjectId),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });
}
