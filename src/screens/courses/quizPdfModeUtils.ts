export type QuizPdfMode = "questions" | "answers";

export const getQuizPdfPath = (testId: number, mode: QuizPdfMode) =>
  mode === "answers"
    ? `/api/theme-test/${testId}/answer-pdf`
    : `/api/theme-test/${testId}/pdf`;

export const getQuizPdfToggleLabel = (mode: QuizPdfMode) =>
  mode === "answers" ? "Misollar" : "Yechimlar";
