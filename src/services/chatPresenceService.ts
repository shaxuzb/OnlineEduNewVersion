let activeChatThreadId: string | null = null;

export const setChatScreenVisible = (
  threadId: number | string | null,
  visible: boolean,
) => {
  const normalizedThreadId = threadId == null ? null : String(threadId);

  if (visible && normalizedThreadId) {
    activeChatThreadId = normalizedThreadId;
    return;
  }

  if (
    normalizedThreadId === null ||
    activeChatThreadId === normalizedThreadId
  ) {
    activeChatThreadId = null;
  }
};

export const isChatScreenVisible = (threadId: number | string) =>
  activeChatThreadId === String(threadId);
