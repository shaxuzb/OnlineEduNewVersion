/// <reference types="jest" />

import {
  isMockTestChapter,
  normalizeMockTest,
} from "./mockTestUtils";

describe("mock test payload normalization", () => {
  const mockChapter = {
    id: -1,
    name: "Mock Test (1-2 bob)",
    ordinalNumber: 2,
    subjectId: 1,
    subject: "Algebra",
    subjectCode: "ALGEBRA",
    subjectType: "COMMON",
    stateId: 1,
    state: "Актив",
    themes: [],
    itemType: "MOCK_TEST",
    isMockTest: true,
    mockTestId: 1,
    mockTestName: "Algebra mock",
    mockTestQuestionCount: 10,
    hasMockTestPdf: true,
    hasMockTestAnswerPdf: false,
    hasAccess: true,
    themeUnitPrice: 0,
    themesCount: 0,
    paidThemesCount: 0,
    price: 0,
    percent: 0,
  };

  it("identifies a mock-test chapter without misclassifying normal chapters", () => {
    expect(isMockTestChapter(mockChapter)).toBe(true);
    expect(
      isMockTestChapter({
        ...mockChapter,
        itemType: "CHAPTER",
        isMockTest: false,
      }),
    ).toBe(false);
  });

  it("normalizes mock answer keys with array options", () => {
    const result = normalizeMockTest({
      id: 1,
      subjectId: 1,
      name: "Algebra mock",
      questionCount: 1,
      hasAccess: true,
      hasTestPdf: true,
      hasAnswerPdf: false,
      answerKeys: [
        {
          id: 10,
          questionNumber: 1,
          dbQuestionNumber: 10,
          subTestNo: 1,
          partIndex: 0,
          answerType: 1,
          options: ["A", "B", "C", "D"],
          points: 1,
        },
      ],
    });

    expect(result.answerKeys[0].options).toBe(
      JSON.stringify(["A", "B", "C", "D"]),
    );
    expect(result.answerKeys[0].partLabel).toBeNull();
    expect(result.hasAnswerPdf).toBe(false);
  });

  it("keeps JSON-string options compatible with the quiz UI", () => {
    const result = normalizeMockTest({
      id: 1,
      subjectId: 1,
      name: "Algebra mock",
      questionCount: 1,
      answerKeys: [
        {
          id: 10,
          questionNumber: 1,
          dbQuestionNumber: 10,
          subTestNo: 1,
          partIndex: 0,
          answerType: 1,
          options: '["A","B"]',
          points: 1,
        },
      ],
    });

    expect(result.answerKeys[0].options).toBe('["A","B"]');
  });
});
