/// <reference types="jest" />

import { AnswerKey } from "../../types";
import {
  buildMockSubmissionAnswers,
  getMockTestGridMaxHeight,
  getMockSubTestNumbers,
  getMockTestAnswers,
  splitMockTestColumns,
} from "./mockQuizScreenUtils";

const answerKeys: AnswerKey[] = [
  {
    id: 1,
    questionNumber: 1,
    dbQuestionNumber: 101,
    partIndex: 0,
    subTestNo: 1,
    partLabel: null,
    correctAnswer: "A",
    testPhotos: [],
    answerType: 1,
    options: '["A","B"]',
    points: 1,
    videoFileId: null,
  },
  {
    id: 2,
    questionNumber: 1,
    dbQuestionNumber: 201,
    partIndex: 0,
    subTestNo: 2,
    partLabel: null,
    correctAnswer: "B",
    testPhotos: [],
    answerType: 1,
    options: '["A","B"]',
    points: 1,
    videoFileId: null,
  },
];

describe("mock quiz screen utilities", () => {
  it("groups answer keys and exposes sorted sub-test numbers", () => {
    expect(getMockTestAnswers(answerKeys, 2)).toEqual([answerKeys[1]]);
    expect(getMockSubTestNumbers(answerKeys)).toEqual([1, 2]);
  });

  it("builds the mock result request from confirmed answers", () => {
    expect(
      buildMockSubmissionAnswers(answerKeys, {
        101: { selectedOption: "A", subTestNo: 1 },
        201: { selectedOption: null, subTestNo: 2 },
      }),
    ).toEqual([
      {
        questionNumber: 101,
        subTestNo: 1,
        partIndex: 0,
        answer: "A",
      },
    ]);
  });

  it("keeps the existing 10-per-column layout through 20 questions", () => {
    const [leftColumn, rightColumn] = splitMockTestColumns(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );

    expect(leftColumn).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(rightColumn).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("balances both columns when a mock test has more than 20 questions", () => {
    const questions = Array.from({ length: 25 }, (_, index) => index + 1);
    const [leftColumn, rightColumn] = splitMockTestColumns(questions);

    expect(leftColumn).toHaveLength(13);
    expect(rightColumn).toHaveLength(12);
    expect(leftColumn.at(-1)).toBe(13);
    expect(rightColumn[0]).toBe(14);

    const [thirtyLeft, thirtyRight] = splitMockTestColumns(
      Array.from({ length: 30 }, (_, index) => index + 1),
    );

    expect(thirtyLeft).toHaveLength(15);
    expect(thirtyRight).toHaveLength(15);
  });

  it("limits the grid viewport to exactly 13 visible rows", () => {
    expect(getMockTestGridMaxHeight(36, 8)).toBe(572);
  });
});
