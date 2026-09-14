import { MockTestChapter } from "../../types";

export const getMockTestCardMeta = (chapter: MockTestChapter) => ({
  title: chapter.mockTestName || chapter.name,
  hasAccess: chapter.hasAccess,
});
