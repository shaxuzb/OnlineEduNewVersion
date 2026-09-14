import { getCertificateQuizPdfPath } from "./certificatePdfUtils";

describe("getCertificateQuizPdfPath", () => {
  it("builds the protected certificate quiz PDF path", () => {
    expect(getCertificateQuizPdfPath(42)).toBe("/theme-test/42/pdf");
  });

  it("normalizes numeric-like ids", () => {
    expect(getCertificateQuizPdfPath(Number("7"))).toBe("/theme-test/7/pdf");
  });
});
