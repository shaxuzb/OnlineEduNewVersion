import { QuizResultAnswer, QuizResultData, QuizResultsResponse } from "../../types";

export interface MockWrongAnswerGroup {
  subTestNo: number;
  answers: QuizResultAnswer[];
}

export const getLatestMockResult = (
  results: QuizResultsResponse | undefined,
): QuizResultData | undefined =>
  Array.isArray(results) && results.length > 0 ? results[0] : undefined;

export const groupMockWrongAnswers = (
  result: QuizResultData | undefined,
): MockWrongAnswerGroup[] => {
  if (!result) return [];

  const grouped = new Map<number, QuizResultAnswer[]>();
  result.answers
    .filter((answer) => !answer.isCorrect)
    .forEach((answer) => {
      const current = grouped.get(answer.subTestNo) ?? [];
      current.push(answer);
      grouped.set(answer.subTestNo, current);
    });

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left - right)
    .map(([subTestNo, answers]) => ({ subTestNo, answers }));
};
