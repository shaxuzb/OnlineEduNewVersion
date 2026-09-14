import { $axiosPrivate } from "./AxiosService";
import {
  MockTest,
  ThemeTest,
  QuizSubmissionRequest,
  QuizResult,
  QuizResultsResponse,
  QuizResultHistoryResponse,
} from "../types";
import { normalizeMockTest } from "./mockTestUtils";

export const quizService = {
  // Get theme test data with answer keys
  getThemeTest: async (testId: number): Promise<ThemeTest> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}`);
    return response.data;
  },

  // Get PDF file for the test
  getTestPdf: async (testId: number): Promise<Blob> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}/pdf`, {
      responseType: "blob", // Important for file download
    });
    return response.data;
  },

  getMockTest: async (mockTestId: number): Promise<MockTest> => {
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

  // Submit quiz results
  submitTestResults: async (
    submissionData: QuizSubmissionRequest,
  ): Promise<QuizResult> => {
    const response = await $axiosPrivate.post(
      "/theme-test-results",
      submissionData,
    );
    return response.data;
  },

  submitMockTestResults: async (
    submissionData: QuizSubmissionRequest,
  ): Promise<QuizResult> => {
    const response = await $axiosPrivate.post(
      "/mock-test-results",
      submissionData,
    );
    return response.data;
  },

  // Get quiz results for user and theme
  getQuizResults: async (
    userId: number,
    themeId: number,
  ): Promise<QuizResultsResponse> => {
    const response = await $axiosPrivate.get(
      `/theme-test-results?userId=${userId}&themeId=${themeId}`,
    );
    return response.data;
  },

  // Get quiz results history for user and theme
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
