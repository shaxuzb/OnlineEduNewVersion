/// <reference types="jest" />

import {
  normalizeQuizAttemptQuestion,
  normalizeThemeTest,
  toLegacyQuizSubmission,
} from "./quizAttemptUtils";

describe("quiz attempt boundary", () => {
  it("drops correctAnswer from active attempt questions", () => {
    const result = normalizeQuizAttemptQuestion({
      id: 1,
      questionNumber: 1,
      dbQuestionNumber: 101,
      partIndex: 0,
      subTestNo: 1,
      partLabel: null,
      correctAnswer: "B",
      testPhotos: [],
      answerType: 1,
      options: ["A", "B", "C"],
      points: 1,
      videoFileId: null,
    });

    expect(result).not.toHaveProperty("correctAnswer");
    expect(result.options).toBe('["A","B","C"]');
  });

  it("normalizes theme-test answer keys through the safe attempt DTO", () => {
    const test = normalizeThemeTest({
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
    });

    expect(test.answerKeys).toHaveLength(1);
    expect(test.answerKeys[0]).not.toHaveProperty("correctAnswer");
  });

  it("adds legacy userId only at the backend compatibility boundary", () => {
    expect(toLegacyQuizSubmission({ testId: 7, answers: [] }, 42)).toEqual({
      testId: 7,
      userId: 42,
      answers: [],
    });
  });
});
