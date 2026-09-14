import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizService } from "../services/quizService";
import { QuizSubmissionRequest } from "../types";
import { useAuth } from "../context/AuthContext";

export const quizKeys = {
  themeTest: (testId: number) => ["themeTest", testId] as const,
  mockTest: (mockTestId: number) => ["mockTest", mockTestId] as const,
  testPdf: (testId: number) => ["testPdf", testId] as const,
  quizResults: (userId: number, themeId: number) =>
    ["quizResults", userId, themeId] as const,
  quizResultsHistory: (userId: number, themeId: number) =>
    ["quizResultsHistory", userId, themeId] as const,
  mockQuizResults: (userId: number, mockTestId: number) =>
    ["mockQuizResults", userId, mockTestId] as const,
  mockQuizResultsHistory: (userId: number, mockTestId: number) =>
    ["mockQuizResultsHistory", userId, mockTestId] as const,
};

export function useThemeTest(testId: number) {
  return useQuery({
    queryKey: quizKeys.themeTest(testId),
    queryFn: () => quizService.getThemeTest(testId),
    enabled: !!testId, // Only run if testId is provided
  });
}

export function useMockTest(mockTestId: number) {
  return useQuery({
    queryKey: quizKeys.mockTest(mockTestId),
    queryFn: () => quizService.getMockTest(mockTestId),
    enabled: !!mockTestId,
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

export function useSubmitMockTestResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionData: QuizSubmissionRequest) =>
      quizService.submitMockTestResults(submissionData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mockQuizResults"] });
      queryClient.invalidateQueries({
        queryKey: quizKeys.mockTest(variables.testId),
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

export function useMockQuizResults(userId: number, mockTestId: number) {
  return useQuery({
    queryKey: quizKeys.mockQuizResults(userId, mockTestId),
    queryFn: () => quizService.getMockQuizResults(userId, mockTestId),
    enabled: !!userId && !!mockTestId,
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

export function useMockQuizResultsHistory(
  userId: number,
  mockTestId: number,
) {
  return useQuery({
    queryKey: quizKeys.mockQuizResultsHistory(userId, mockTestId),
    queryFn: () => quizService.getMockQuizResultsHistory(userId, mockTestId),
    enabled: !!userId && !!mockTestId,
    staleTime: 60 * 1000,
  });
}
