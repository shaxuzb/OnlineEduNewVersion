export const resolveApiBaseUrl = (apiUrl: unknown): string => {
  if (typeof apiUrl !== "string" || !apiUrl.trim()) {
    throw new Error("API_URL is not configured");
  }

  return `${apiUrl.replace(/\/$/, "")}/api`;
};
