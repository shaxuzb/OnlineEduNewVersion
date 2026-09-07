/// <reference types="jest" />

import {
  isChatScreenVisible,
  setChatScreenVisible,
} from "./chatPresenceService";

describe("chat screen presence", () => {
  afterEach(() => {
    setChatScreenVisible(null, false);
  });

  it("only marks the active chat thread as visible", () => {
    setChatScreenVisible(42, true);

    expect(isChatScreenVisible(42)).toBe(true);
    expect(isChatScreenVisible(43)).toBe(false);

    setChatScreenVisible(42, false);
    expect(isChatScreenVisible(42)).toBe(false);
  });
});
