export const isProtectedMediaReady = (
  uri: string,
  headers: Record<string, string>,
): boolean =>
  Boolean(uri.trim()) && Boolean(headers.Authorization?.trim());
