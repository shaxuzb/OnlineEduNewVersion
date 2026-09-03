/// <reference types="jest" />

import { statisticsKeys } from "./statisticsKeys";

describe("statistics query keys", () => {
  it("keeps statistics isolated per user", () => {
    expect(statisticsKeys.subjects(7)).toEqual(["statistics", "subjects", 7]);
    expect(statisticsKeys.themes(7, 3)).toEqual([
      "statistics",
      "themes",
      7,
      3,
    ]);
    expect(statisticsKeys.test(7, 3, 11)).toEqual([
      "statistics",
      "test",
      7,
      3,
      11,
    ]);
  });
});
