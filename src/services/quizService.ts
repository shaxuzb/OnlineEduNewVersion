import { $axiosPrivate } from "./AxiosService";
import {
  QuizResult,
  QuizResultsResponse,
  QuizResultHistoryResponse,
} from "../types";
import { normalizeMockTest } from "./mockTestUtils";
import {
  normalizeThemeTest,
  QuizAttemptSubmission,
  SafeMockTest,
  SafeThemeTest,
  toLegacyQuizSubmission,
} from "./quizAttemptUtils";

export const quizService = {
  getThemeTest: async (testId: number): Promise<SafeThemeTest> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}`);
    return normalizeThemeTest(response.data);
  },

  getTestPdf: async (testId: number): Promise<Blob> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getMockTest: async (mockTestId: number): Promise<SafeMockTest> => {
    const response = await $axiosPrivate.get(`/mock-tests/${mockTestId}`);
    return normalizeMockTest(response.data);
  },

  getMockTestPdf: async (mockTestId: number): Promise<Blob> => {
    const response = await $axiosPrivate.get(`/mock-tests/${mockTestId}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  getMockTestAnswerPdf: async (mockTestId: number): Promise<Blob> => {
    const response = await $axiosPrivate.get(
      `/mock-tests/${mockTestId}/answer-pdf`,
      { responseType: "blob" },
    );
    return response.data;
  },

  submitTestResults: async (
    submissionData: QuizAttemptSubmission,
    userId: number,
  ): Promise<QuizResult> => {
    // Temporary backend compatibility: the server should derive userId from JWT claims.
    const response = await $axiosPrivate.post(
      "/theme-test-results",
      toLegacyQuizSubmission(submissionData, userId),
    );
    return response.data;
  },

  submitMockTestResults: async (
    submissionData: QuizAttemptSubmission,
    userId: number,
  ): Promise<QuizResult> => {
    // Temporary backend compatibility: the server should derive userId from JWT claims.
    const response = await $axiosPrivate.post(
      "/mock-test-results",
      toLegacyQuizSubmission(submissionData, userId),
    );
    return response.data;
  },

  getQuizResults: async (
    userId: number,
    themeId: number,
  ): Promise<QuizResultsResponse> => {
    const response = await $axiosPrivate.get(
      `/theme-test-results?userId=${userId}&themeId=${themeId}`,
    );
    return response.data;
  },

  getQuizResultsHistory: async (
    userId: number,
    themeId: number,
  ): Promise<QuizResultHistoryResponse> => {
    const response = await $axiosPrivate.get(
      `/theme-test-results/history?userId=${userId}&themeId=${themeId}`,
    );
    return response.data;
  },

  getMockQuizResults: async (
    userId: number,
    mockTestId: number,
  ): Promise<QuizResultsResponse> => {
    const response = await $axiosPrivate.get(
      `/mock-test-results?userId=${userId}&mockTestId=${mockTestId}`,
    );
    return response.data;
  },

  getMockQuizResultsHistory: async (
    userId: number,
    mockTestId: number,
  ): Promise<QuizResultHistoryResponse> => {
    const response = await $axiosPrivate.get(
      `/mock-test-results/history?userId=${userId}&mockTestId=${mockTestId}`,
    );
    return response.data;
  },
};
