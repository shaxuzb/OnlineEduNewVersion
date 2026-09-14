/// <reference types="jest" />

import { $axiosPrivate } from "./AxiosService";
import { quizService } from "./quizService";

jest.mock("./AxiosService", () => ({
  $axiosPrivate: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const privateApi = $axiosPrivate as unknown as {
  get: jest.Mock;
  post: jest.Mock;
};

describe("quiz service security boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("strips correctAnswer from theme-test data before returning it to the app", async () => {
    privateApi.get.mockResolvedValueOnce({
      data: {
        id: 7,
        themeId: 3,
        fileName: "test.pdf",
        originalName: "Test",
        questionCount: 1,
        testTypeId: 1,
        answerKeys: [
          {
            id: 1,
            questionNumber: 1,
            dbQuestionNumber: 101,
            partIndex: 0,
            subTestNo: 1,
            correctAnswer: "A",
            testPhotos: [],
            options: ["A", "B"],
          },
        ],
      },
    });

    const result = await quizService.getThemeTest(7);

    expect(privateApi.get).toHaveBeenCalledWith("/theme-test/7");
    expect(result.answerKeys[0]).not.toHaveProperty("correctAnswer");
  });

  it("loads mock test details and PDF", async () => {
    privateApi.get
      .mockResolvedValueOnce({ data: { id: 7, answerKeys: [] } })
      .mockResolvedValueOnce({ data: "pdf" });

    await quizService.getMockTest(7);
    await quizService.getMockTestPdf(7);

    expect(privateApi.get).toHaveBeenNthCalledWith(1, "/mock-tests/7");
    expect(privateApi.get).toHaveBeenNthCalledWith(2, "/mock-tests/7/pdf", {
      responseType: "blob",
    });
  });

  it("adds authenticated userId only at the mock submission API boundary", async () => {
    const submission = { testId: 7, answers: [] };
    privateApi.post.mockResolvedValueOnce({ data: { testId: 7 } });

    await quizService.submitMockTestResults(submission, 42);

    expect(submission).toEqual({ testId: 7, answers: [] });
    expect(privateApi.post).toHaveBeenCalledWith("/mock-test-results", {
      testId: 7,
      userId: 42,
      answers: [],
    });
  });

  it("adds authenticated userId only at the theme submission API boundary", async () => {
    const submission = { testId: 7, answers: [] };
    privateApi.post.mockResolvedValueOnce({ data: { testId: 7 } });

    await quizService.submitTestResults(submission, 42);

    expect(privateApi.post).toHaveBeenCalledWith("/theme-test-results", {
      testId: 7,
      userId: 42,
      answers: [],
    });
  });

  it("loads mock results by mockTestId", async () => {
    privateApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await quizService.getMockQuizResults(42, 7);
    await quizService.getMockQuizResultsHistory(42, 7);

    expect(privateApi.get).toHaveBeenNthCalledWith(
      1,
      "/mock-test-results?userId=42&mockTestId=7",
    );
    expect(privateApi.get).toHaveBeenNthCalledWith(
      2,
      "/mock-test-results/history?userId=42&mockTestId=7",
    );
  });
});
