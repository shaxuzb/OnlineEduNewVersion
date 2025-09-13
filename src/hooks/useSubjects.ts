import { useQuery } from '@tanstack/react-query';
import { subjectsService } from '../services/subjectsService';
import { SubjectsResponse } from '../types';

export const subjectsKeys = {
  all: ['subjects'] as const,
};

export function useSubjects() {
  return useQuery<SubjectsResponse>({
    queryKey: subjectsKeys.all,
    queryFn: subjectsService.getSubjects,
  });
}

