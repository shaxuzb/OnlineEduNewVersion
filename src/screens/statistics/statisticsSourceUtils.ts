export type StatisticsResultSource =
  | "mockTest"
  | "themeTest"
  | "nationalCertificate";

export type StatisticsResultActions = {
  history: "MockQuizResultsHistory" | "QuizResultsHistorySertificate";
  solution: "MockQuizSolution" | "QuizSolution" | "QuizSolutionSertificate";
};

export const getStatisticsResultSource = (
  subjectCode?: string,
): StatisticsResultSource => {
  const normalizedCode = subjectCode?.trim().toUpperCase();

  if (normalizedCode === "ALGEBRA" || normalizedCode === "GEOMETRY") {
    return "mockTest";
  }

  if (normalizedCode === "NATIONAL_CERTIFICATE") {
    return "nationalCertificate";
  }

  return "themeTest";
};

export const getStatisticsResultActions = (
  source: StatisticsResultSource,
): StatisticsResultActions => {
  if (source === "mockTest") {
    return {
      history: "MockQuizResultsHistory",
      solution: "MockQuizSolution",
    };
  }

  if (source === "nationalCertificate") {
    return {
      history: "QuizResultsHistorySertificate",
      solution: "QuizSolutionSertificate",
    };
  }

  return {
    history: "QuizResultsHistorySertificate",
    solution: "QuizSolution",
  };
};

export const shouldShowStatisticsEmptyState = ({
  isFetched,
  isFetching,
  hasData,
}: {
  isFetched: boolean;
  isFetching: boolean;
  hasData: boolean;
}) => isFetched && !isFetching && !hasData;

export type StatisticsViewState = "loading" | "error" | "empty" | "ready";

export type StatisticsQueryState = {
  /** `false` when the query is disabled because its parameters are missing. */
  isEnabled: boolean;
  isPending: boolean;
  isFetching: boolean;
  hasError: boolean;
  hasData: boolean;
};

/**
 * Derives a single view state from a react-query result.
 *
 * Mixing `isLoading`, `isFetching` and `isFetched` by hand made the results
 * screen flash its error state on the first render of a cached-but-empty
 * query, and hide the spinner while a background refetch was running. Keeping
 * the precedence in one place (data > loading > error > empty) removes both.
 */
export const resolveStatisticsViewState = ({
  isEnabled,
  isPending,
  isFetching,
  hasError,
  hasData,
}: StatisticsQueryState): StatisticsViewState => {
  if (!isEnabled) return hasData ? "ready" : "empty";
  if (hasData) return "ready";
  if (isFetching || isPending) return "loading";
  if (hasError) return "error";
  return "empty";
};
