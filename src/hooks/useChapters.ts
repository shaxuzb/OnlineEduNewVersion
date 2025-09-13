import { useQuery } from '@tanstack/react-query';
import { chaptersService } from '../services/chaptersService';
import { ChaptersResponse } from '../types';

export const chaptersKeys = {
  all: ['chapters'] as const,
  bySubject: (subjectId: number) => [...chaptersKeys.all, 'subject', subjectId] as const,
};

export function useChapters(subjectId: number) {
  return useQuery<ChaptersResponse>({
    queryKey: chaptersKeys.bySubject(subjectId),
    queryFn: () => chaptersService.getChaptersBySubjectId(subjectId),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });
}

