import { MockTestChapter } from "../types";
import {
  normalizeQuizAttemptQuestion,
  SafeMockTest,
} from "./quizAttemptUtils";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toStringOrNull = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

export const isMockTestChapter = (
  value: unknown,
): value is MockTestChapter => {
  if (!isRecord(value)) return false;
  return value.itemType === "MOCK_TEST" || value.isMockTest === true;
};

export const normalizeMockTest = (value: unknown): SafeMockTest => {
  const raw = isRecord(value) ? value : {};
  const rawChapters = Array.isArray(raw.chapters) ? raw.chapters : [];

  return {
    id: toNumber(raw.id ?? raw.mockTestId, 0),
    subjectId: toNumber(raw.subjectId, 0),
    name:
      toStringOrNull(raw.name ?? raw.mockTestName) ??
      toStringOrNull(raw.originalName) ??
      "Mock test",
    ...(toStringOrNull(raw.originalName)
      ? { originalName: toStringOrNull(raw.originalName) ?? undefined }
      : {}),
    questionCount: toNumber(
      raw.questionCount ?? raw.mockTestQuestionCount,
      0,
    ),
    chapters: rawChapters.filter(isRecord).map((chapter) => ({
      id: toNumber(chapter.id, 0),
      name: toStringOrNull(chapter.name) ?? "",
    })),
    answerKeys: Array.isArray(raw.answerKeys)
      ? raw.answerKeys.map(normalizeQuizAttemptQuestion)
      : [],
    hasAccess: raw.hasAccess !== false,
    hasTestPdf: raw.hasTestPdf === true,
    hasAnswerPdf: raw.hasAnswerPdf === true,
  };
};
