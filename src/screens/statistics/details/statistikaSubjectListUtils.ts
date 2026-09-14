import {
  ChapterThemeStatistic,
  ChapterWithThemesStatistic,
} from "@/src/types";

export type StatisticsSubjectSection = {
  key: string;
  title: string;
  data: ChapterThemeStatistic[];
};

export const buildStatisticsSections = (
  chapters?: ChapterWithThemesStatistic[],
): StatisticsSubjectSection[] =>
  chapters?.map((chapter) => ({
    key: `chapter-${chapter.id}`,
    title: `${chapter.ordinalNumber}-bob. ${chapter.name}`,
    data: chapter.themes,
  })) ?? [];

export const getStatisticsThemeKey = (theme: ChapterThemeStatistic): string =>
  `theme-${theme.id}`;
