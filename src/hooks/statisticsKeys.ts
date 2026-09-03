export const statisticsKeys = {
  all: ["statistics"] as const,
  subjects: (userId: number) => ["statistics", "subjects", userId] as const,
  themes: (userId: number, subjectId: number) =>
    ["statistics", "themes", userId, subjectId] as const,
  test: (userId: number, subjectId: number, testId: number) =>
    ["statistics", "test", userId, subjectId, testId] as const,
};
