/// <reference types="jest" />

import {
  getStatisticsResultActions,
  getStatisticsResultSource,
  resolveStatisticsViewState,
  shouldShowStatisticsEmptyState,
} from "./statisticsSourceUtils";

describe("statistics result source", () => {
  it("uses mock-test results for Algebra and Geometry", () => {
    expect(getStatisticsResultSource("ALGEBRA")).toBe("mockTest");
    expect(getStatisticsResultSource("GEOMETRY")).toBe("mockTest");
  });

  it("keeps National Certificate on its dedicated result source", () => {
    expect(getStatisticsResultSource("NATIONAL_CERTIFICATE")).toBe(
      "nationalCertificate",
    );
  });

  it("uses ThemeTest results for School Math and unknown subject codes", () => {
    expect(getStatisticsResultSource("SCHOOL_MATH")).toBe("themeTest");
    expect(getStatisticsResultSource("OTHER_SUBJECT")).toBe("themeTest");
  });

  it("maps mock, certificate, and theme results to their existing screens", () => {
    expect(getStatisticsResultActions("mockTest")).toEqual({
      history: "MockQuizResultsHistory",
      solution: "MockQuizSolution",
    });
    expect(getStatisticsResultActions("nationalCertificate")).toEqual({
      history: "QuizResultsHistorySertificate",
      solution: "QuizSolutionSertificate",
    });
    expect(getStatisticsResultActions("themeTest")).toEqual({
      history: "QuizResultsHistorySertificate",
      solution: "QuizSolution",
    });
  });

  it("does not show empty state while the result query is still fetching", () => {
    expect(
      shouldShowStatisticsEmptyState({
        isFetched: false,
        isFetching: true,
        hasData: false,
      }),
    ).toBe(false);
    expect(
      shouldShowStatisticsEmptyState({
        isFetched: true,
        isFetching: false,
        hasData: false,
      }),
    ).toBe(true);
  });
  describe("resolveStatisticsViewState", () => {
    const base = {
      isEnabled: true,
      isPending: false,
      isFetching: false,
      hasError: false,
      hasData: false,
    };

    it("keeps showing the loading state while the first fetch runs", () => {
      expect(
        resolveStatisticsViewState({
          ...base,
          isPending: true,
          isFetching: true,
        }),
      ).toBe("loading");
    });

    it("does not flash an error while a cached-empty query refetches", () => {
      expect(
        resolveStatisticsViewState({ ...base, isFetching: true }),
      ).toBe("loading");
    });

    it("prefers rendering data over a background refetch", () => {
      expect(
        resolveStatisticsViewState({
          ...base,
          isFetching: true,
          hasData: true,
        }),
      ).toBe("ready");
    });

    it("separates a failed request from an empty result", () => {
      expect(resolveStatisticsViewState({ ...base, hasError: true })).toBe(
        "error",
      );
      expect(resolveStatisticsViewState(base)).toBe("empty");
    });

    it("does not hang on a disabled query", () => {
      expect(
        resolveStatisticsViewState({
          ...base,
          isEnabled: false,
          isPending: true,
        }),
      ).toBe("empty");
    });
  });
});
