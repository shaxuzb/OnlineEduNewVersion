import {
  AnswerKey,
  MockTest,
  QuizAnswer,
  QuizSubmissionRequest,
  ThemeTest,
} from "../types";

export type QuizAttemptQuestion = Omit<AnswerKey, "correctAnswer">;

export interface QuizAttemptSubmission {
  testId: number;
  answers: Array<QuizAnswer & { subTestNo?: number }>;
  /** @deprecated Caller-provided identity is ignored; AuthContext identity is used. */
  userId?: number;
}

export type SafeThemeTest = Omit<ThemeTest, "answerKeys"> & {
  answerKeys: QuizAttemptQuestion[];
};

export type SafeMockTest = Omit<MockTest, "answerKeys"> & {
  answerKeys: QuizAttemptQuestion[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toNullableString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value : null;

const normalizeOptions = (value: unknown): string | null => {
  if (Array.isArray(value)) return JSON.stringify(value);
  return typeof value === "string" ? value : null;
};

const normalizePhotos = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).flatMap((photo) => {
    const fileId = toNullableString(photo.fileId);
    const relativePath = toNullableString(photo.relativePath);
    return fileId && relativePath ? [{ fileId, relativePath }] : [];
  });
};

export const normalizeQuizAttemptQuestion = (
  value: unknown,
): QuizAttemptQuestion => {
  const raw = isRecord(value) ? value : {};
  const questionNumber = toNumber(raw.questionNumber);

  return {
    id: toNumber(raw.id, questionNumber),
    questionNumber,
    dbQuestionNumber: toNumber(raw.dbQuestionNumber, questionNumber),
    partIndex: toNumber(raw.partIndex),
    subTestNo: toNumber(raw.subTestNo, 1),
    partLabel: toNullableString(raw.partLabel),
    testPhotos: normalizePhotos(raw.testPhotos ?? raw.photos),
    answerType: toNumber(raw.answerType, 1),
    options: normalizeOptions(raw.options),
    points: toNumber(raw.points, 1),
    videoFileId: toNullableString(raw.videoFileId),
  };
};

export const normalizeThemeTest = (value: unknown): SafeThemeTest => {
  const raw = isRecord(value) ? value : {};

  return {
    id: toNumber(raw.id),
    themeId: toNumber(raw.themeId),
    fileName: toNullableString(raw.fileName) ?? "",
    originalName: toNullableString(raw.originalName) ?? "",
    questionCount: toNumber(raw.questionCount),
    testTypeId: toNumber(raw.testTypeId),
    answerKeys: Array.isArray(raw.answerKeys)
      ? raw.answerKeys.map(normalizeQuizAttemptQuestion)
      : [],
  };
};

export const toLegacyQuizSubmission = (
  submission: QuizAttemptSubmission,
  userId: number,
): QuizSubmissionRequest =>
  ({
    testId: submission.testId,
    userId,
    answers: submission.answers.map(
      ({ questionNumber, partIndex, answer, subTestNo }) => ({
        questionNumber,
        partIndex,
        answer,
        ...(subTestNo !== undefined ? { subTestNo } : {}),
      }),
    ),
  }) as QuizSubmissionRequest;
