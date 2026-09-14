/// <reference types="jest" />

import {
  getStatisticsResultActions,
  getStatisticsResultSource,
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
});
