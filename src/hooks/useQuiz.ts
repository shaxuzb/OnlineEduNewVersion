import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizService } from '../services/quizService';
import { QuizSubmissionRequest } from '../types';
import * as SecureStore from 'expo-secure-store';
import { AuthToken } from '../types';

export const quizKeys = {
  themeTest: (testId: number) => ['themeTest', testId] as const,
  testPdf: (testId: number) => ['testPdf', testId] as const,
  quizResults: (userId: number, themeId: number) => ['quizResults', userId, themeId] as const,
};

export function useThemeTest(testId: number) {
  return useQuery({
    queryKey: quizKeys.themeTest(testId),
    queryFn: () => quizService.getThemeTest(testId),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    enabled: !!testId, // Only run if testId is provided
  });
}

export function useTestPdf(testId: number) {
  return useQuery({
    queryKey: quizKeys.testPdf(testId),
    queryFn: () => quizService.getTestPdf(testId),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
    enabled: !!testId, // Only run if testId is provided
  });
}

export function useSubmitTestResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionData: QuizSubmissionRequest) =>
      quizService.submitTestResults(submissionData),
    onSuccess: (data, variables) => {
      // Invalidate quiz results when new results are submitted
      queryClient.invalidateQueries({
        queryKey: ['quizResults'],
      });
      queryClient.invalidateQueries({
        queryKey: quizKeys.themeTest(variables.testId),
      });
    },
  });
}

export function useQuizResults(userId: number, themeId: number) {
  return useQuery({
    queryKey: quizKeys.quizResults(userId, themeId),
    queryFn: () => quizService.getQuizResults(userId, themeId),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    enabled: !!userId && !!themeId, // Only run if both userId and themeId are provided
  });
}

// Helper hook to get current user ID from secure storage
export function useCurrentUserId(): number | null {
  try {
    const userData = JSON.parse(
      String(SecureStore.getItem('session'))
    ) as AuthToken | null;
    return userData?.user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}
