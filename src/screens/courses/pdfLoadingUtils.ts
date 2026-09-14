export const shouldShowPdfLoading = (
  authToken: string | null,
  isPdfLoading: boolean,
): boolean => !authToken || isPdfLoading;
