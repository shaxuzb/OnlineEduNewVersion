/// <reference types="jest" />

import { ChapterWithThemesStatistic } from "@/src/types";
import {
  buildStatisticsSections,
  getStatisticsThemeKey,
} from "./statistikaSubjectListUtils";

describe("statistics subject list data", () => {
  it("creates stable section and item keys without depending on list indexes", () => {
    const chapters = [
      {
        id: 1,
        ordinalNumber: 1,
        name: "Natural sonlar",
        themes: [{ id: 23, name: "Mavzu" }],
      },
    ] as unknown as ChapterWithThemesStatistic[];

    expect(buildStatisticsSections(chapters)).toEqual([
      {
        key: "chapter-1",
        title: "1-bob. Natural sonlar",
        data: chapters[0].themes,
      },
    ]);
    expect(getStatisticsThemeKey(chapters[0].themes[0])).toBe("theme-23");
  });

  it("returns an empty list before statistics data arrives", () => {
    expect(buildStatisticsSections(undefined)).toEqual([]);
  });
});
