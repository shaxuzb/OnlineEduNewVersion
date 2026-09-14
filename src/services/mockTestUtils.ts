import {
  AnswerKey,
  MockTest,
  MockTestChapter,
} from "../types";

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

const normalizeOptions = (value: unknown): string | null => {
  if (Array.isArray(value)) return JSON.stringify(value);
  return typeof value === "string" ? value : null;
};

const normalizePhotos = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).flatMap((photo) => {
    const fileId = toStringOrNull(photo.fileId);
    const relativePath = toStringOrNull(photo.relativePath);
    return fileId && relativePath ? [{ fileId, relativePath }] : [];
  });
};

export const isMockTestChapter = (
  value: unknown,
): value is MockTestChapter => {
  if (!isRecord(value)) return false;
  return value.itemType === "MOCK_TEST" || value.isMockTest === true;
};

export const normalizeMockAnswerKey = (value: unknown): AnswerKey => {
  const raw = isRecord(value) ? value : {};
  const questionNumber = toNumber(raw.questionNumber, 0);

  return {
    id: toNumber(raw.id, questionNumber),
    questionNumber,
    dbQuestionNumber: toNumber(
      raw.dbQuestionNumber ?? raw.questionNumber,
      questionNumber,
    ),
    partIndex: toNumber(raw.partIndex, 0),
    subTestNo: toNumber(raw.subTestNo, 1),
    partLabel: toStringOrNull(raw.partLabel),
    correctAnswer: toStringOrNull(raw.correctAnswer) ?? "",
    testPhotos: normalizePhotos(raw.testPhotos ?? raw.photos),
    answerType: toNumber(raw.answerType, 1),
    options: normalizeOptions(raw.options),
    points: toNumber(raw.points, 1),
    videoFileId: toStringOrNull(raw.videoFileId),
  };
};

export const normalizeMockTest = (value: unknown): MockTest => {
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
      ? raw.answerKeys.map(normalizeMockAnswerKey)
      : [],
    hasAccess: raw.hasAccess !== false,
    hasTestPdf: raw.hasTestPdf === true,
    hasAnswerPdf: raw.hasAnswerPdf === true,
  };
};
