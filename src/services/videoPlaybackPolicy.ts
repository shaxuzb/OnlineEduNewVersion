export const isProtectedVideoReady = (
  uri: string,
  headers: Record<string, string>,
): boolean => Boolean(uri.trim()) && Boolean(headers.Authorization?.trim());
