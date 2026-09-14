import { AnswerKey, QuizAnswer } from "../../types";

export interface MockLocalAnswer {
  selectedOption: string | null;
  subTestNo: number;
}

export type MockAnswersByQuestion = Record<number, MockLocalAnswer>;

export const getMockTestAnswers = (
  answerKeys: AnswerKey[] | undefined,
  subTestNo: number,
) => (answerKeys ?? []).filter((item) => item.subTestNo === subTestNo);

export const getMockSubTestNumbers = (answerKeys: AnswerKey[] | undefined) =>
  Array.from(new Set((answerKeys ?? []).map((item) => item.subTestNo))).sort(
    (left, right) => left - right,
  );

export const splitMockTestColumns = <T>(items: readonly T[]): [T[], T[]] => {
  const leftColumnSize =
    items.length <= 20 ? Math.min(items.length, 10) : Math.ceil(items.length / 2);

  return [items.slice(0, leftColumnSize), items.slice(leftColumnSize)];
};

export const getMockTestGridMaxHeight = (
  rowHeight: number,
  rowSpacing: number,
  visibleRows = 13,
) => visibleRows * (rowHeight + rowSpacing);

export const buildMockSubmissionAnswers = (
  answerKeys: AnswerKey[],
  answersByQuestion: MockAnswersByQuestion,
): QuizAnswer[] =>
  answerKeys.flatMap((answerKey) => {
    const answer = answersByQuestion[answerKey.dbQuestionNumber];
    if (!answer?.selectedOption) return [];

    return [
      {
        questionNumber: answerKey.dbQuestionNumber,
        subTestNo: answer.subTestNo,
        partIndex: answerKey.partIndex,
        answer: answer.selectedOption,
      },
    ];
  });
