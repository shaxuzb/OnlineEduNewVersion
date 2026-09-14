import { QuizResultData } from "../../types";
import {
  getLatestMockResult,
  groupMockWrongAnswers,
} from "./mockQuizResultUtils";

const result = (overrides: Partial<QuizResultData> = {}): QuizResultData => ({
  id: 1,
  testId: 10,
  userId: 5,
  percent: 75,
  maxScore: 4,
  score: 3,
  totalQuestionsCount: 4,
  correctQuestionsCount: 3,
  wrongQuestionsCount: 1,
  degree: "B",
  resultMessage: "Yaxshi",
  isNationalSubject: false,
  isSolved: true,
  answers: [
    {
      questionNumber: 1,
      dbQuestionNumber: 101,
      answerFileId: "",
      partLabel: "",
      photos: [],
      answerKeyId: 1,
      partIndex: 0,
      answer: "A",
      subTestNo: 1,
      correctAnswer: "A",
      isCorrect: true,
    },
    {
      questionNumber: 2,
      dbQuestionNumber: 102,
      answerFileId: "",
      partLabel: "",
      photos: [],
      answerKeyId: 2,
      partIndex: 0,
      answer: "B",
      subTestNo: 2,
      correctAnswer: "C",
      isCorrect: false,
    },
  ],
  ...overrides,
});

describe("mockQuizResultUtils", () => {
  it("returns the latest result and safely handles empty responses", () => {
    expect(getLatestMockResult([result()])?.id).toBe(1);
    expect(getLatestMockResult([])).toBeUndefined();
  });

  it("groups only wrong answers by sub-test", () => {
    expect(groupMockWrongAnswers(result())).toEqual([
      { subTestNo: 2, answers: [result().answers[1]] },
    ]);
  });
});
