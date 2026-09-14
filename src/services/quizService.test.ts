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

describe("mock quiz service endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("submits mock answers and loads mock results by mockTestId", async () => {
    const request = {
      testId: 7,
      userId: 42,
      answers: [],
    };
    privateApi.post.mockResolvedValueOnce({ data: { testId: 7 } });
    privateApi.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await quizService.submitMockTestResults(request);
    await quizService.getMockQuizResults(42, 7);
    await quizService.getMockQuizResultsHistory(42, 7);

    expect(privateApi.post).toHaveBeenCalledWith("/mock-test-results", request);
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
