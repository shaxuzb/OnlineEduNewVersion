/// <reference types="jest" />

import { shouldShowPdfLoading } from "./pdfLoadingUtils";

describe("PDF loading state", () => {
  it("waits for the auth token before mounting the PDF", () => {
    expect(shouldShowPdfLoading(null, false)).toBe(true);
  });

  it("shows loading while the current PDF source is being rendered", () => {
    expect(shouldShowPdfLoading("token", true)).toBe(true);
  });

  it("hides the loader only after a token exists and PDF is ready", () => {
    expect(shouldShowPdfLoading("token", false)).toBe(false);
  });
});
