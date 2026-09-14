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
