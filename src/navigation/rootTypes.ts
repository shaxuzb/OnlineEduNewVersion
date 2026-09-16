import type { NavigatorScreenParams } from "@react-navigation/native";
import type { MainTabParamList } from "./mainTabTypes";
import type { PurchaseStackParamList } from "./purchaseTypes";

export type CertificateTestMode = "timed" | "untimed";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Chat: undefined;
  News: undefined;
  StatistikaDetail: {
    userId: number;
    subjectId: number;
    subjectName: string;
    subjectPercent: number;
    subjectCode: string;
  };
  StatistikaDetailTest: {
    subjectId: number;
    testId: number;
    subjectCode: string;
    mavzu: string;
    themeId: number;
    themePercent?: number;
    userId: number;
    themeName: string;
  };
  LessonDetail: {
    themeId: number;
    themeName: string;
    themeOrdinalNumber: string | number;
    percent?: number;
  };
  VideoPlayer: {
    lessonTitle: string;
    videoFileId: string;
    mavzu: string;
  };
  ThemeAbstract: {
    themeId: number;
    mavzu: string;
  };
  QuizScreenSertificate: {
    testId: number;
    mavzu: string;
    testMode?: CertificateTestMode;
  };
  QuizScreen: {
    title?: string;
    testId: number;
    mavzu: string;
    percent?: number;
  };
  QuizResults: {
    testId: number;
    userId: number;
    themeId: number;
    mavzu?: string;
  };
  MockQuizScreen: {
    mockTestId: number;
    mockTestName: string;
    subjectId?: number;
  };
  MockQuizResults: {
    mockTestId: number;
    userId: number;
    mockTestName: string;
  };
  MockQuizSolution: {
    mockTestId: number;
    userId: number;
    mockTestName: string;
  };
  MockQuizResultsHistory: {
    mockTestId: number;
    userId: number;
    mockTestName?: string;
  };
  QuizResultsSertificate: {
    testId: number;
    userId: number;
    themeId: number;
    mavzu?: string;
  };
  QuizResultsHistorySertificate: {
    userId: number;
    themeId: number;
    themeName?: string;
  };
  QuizSolution: {
    themeId: number;
    userId: number;
    testId: number;
    mavzu: string;
    percent: number | string;
  };
  QuizSolutionSertificate: {
    themeId: number;
    userId: number;
    testId: number;
    mavzu: string;
    percent: number | string;
  };
  Profile: undefined;
  PersonalInfo: undefined;
  PurchaseGroup: NavigatorScreenParams<PurchaseStackParamList> | undefined;
  PaymentOrders: undefined;
};
