import {
  getQuizPdfPath,
  getQuizPdfToggleLabel,
  QuizPdfMode,
} from "./quizPdfModeUtils";

describe("quiz PDF mode", () => {
  it("uses the matching endpoint and toggle label for each PDF mode", () => {
    const expectations: Array<[QuizPdfMode, string, string]> = [
      ["questions", "/api/theme-test/36/pdf", "Yechimlar"],
      ["answers", "/api/theme-test/36/answer-pdf", "Misollar"],
    ];

    expectations.forEach(([mode, path, label]) => {
      expect(getQuizPdfPath(36, mode)).toBe(path);
      expect(getQuizPdfToggleLabel(mode)).toBe(label);
    });
  });
});
