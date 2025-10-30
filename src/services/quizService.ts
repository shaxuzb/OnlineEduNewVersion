import { $axiosPrivate } from './AxiosService';
import { ThemeTest, QuizSubmissionRequest, QuizResult, QuizResultsResponse } from '../types';

export const quizService = {
  // Get theme test data with answer keys
  getThemeTest: async (testId: number): Promise<ThemeTest> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}`);
    return response.data;
  },

  // Get PDF file for the test
  getTestPdf: async (testId: number): Promise<Blob> => {
    const response = await $axiosPrivate.get(`/theme-test/${testId}/pdf`, {
      responseType: 'blob', // Important for file download
    });
    return response.data;
  },

  // Submit quiz results
  submitTestResults: async (submissionData: QuizSubmissionRequest): Promise<QuizResult> => {
    const response = await $axiosPrivate.post('/theme-test-results', submissionData);
    return response.data;
  },

  // Get quiz results for user and theme
  getQuizResults: async (userId: number, themeId: number): Promise<QuizResultsResponse> => {
    const response = await $axiosPrivate.get(`/theme-test-results?userId=${userId}&themeId=${themeId}`);
    return response.data;
  },

};
