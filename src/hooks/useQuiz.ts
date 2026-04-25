import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "../services/quizService";
import { QuizSubmissionRequest } from "../types";
import { useAuth } from "../context/AuthContext";

export const quizKeys = {
  themeTest: (testId: number) => ["themeTest", testId] as const,
  testPdf: (testId: number) => ["testPdf", testId] as const,
  quizResults: (userId: number, themeId: number) =>
    ["quizResults", userId, themeId] as const,
  quizResultsHistory: (userId: number, themeId: number) =>
    ["quizResultsHistory", userId, themeId] as const,
};

export function useThemeTest(testId: number) {
  return useQuery({
    queryKey: quizKeys.themeTest(testId),
    queryFn: () => quizService.getThemeTest(testId),
    enabled: !!testId, // Only run if testId is provided
  });
}

export function useTestPdf(testId: number) {
  return useQuery({
    queryKey: quizKeys.testPdf(testId),
    queryFn: () => quizService.getTestPdf(testId),
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
        queryKey: ["quizResults"],
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
    enabled: !!userId && !!themeId, // Only run if both userId and themeId are provided
  });
}
// Helper hook to get current user ID from auth context
export function useCurrentUserId(): number | null {
  const { user } = useAuth();
  return user?.id || null;
}

export function useQuizResultsHistory(userId: number, themeId: number) {
  return useQuery({
    queryKey: quizKeys.quizResultsHistory(userId, themeId),
    queryFn: () => quizService.getQuizResultsHistory(userId, themeId),
    enabled: !!userId && !!themeId, // Only run if both userId and themeId are provided
    staleTime: 60 * 1000,
  });
}
