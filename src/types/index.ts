export interface AuthUserData {
  id: number;
  userName: string;
  phoneNumber: string;
  organizationId: number;
  organizationName: string;
  fullName: string;
  role: string;
  roleId: number;
  state: string;
  stateId: number;
  isParent: boolean;
  modules: number[];
  permissions: string[];
}
export interface AuthToken {
  token: string;
  refreshToken: string;
  user: AuthUserData;
}

export interface Lesson {
  id: number;
  title: string;
  isLocked: boolean;
  isCompleted: boolean;
  duration?: string;
  description?: string;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  studentsCount: number;
  sections: CourseSection[];
  thumbnail?: string;
}

// User interface removed - using AuthUserData instead

export interface BookmarkedLesson {
  id: number;
  title: string;
  mavzu: string;
  courseType:
    | "algebra"
    | "geometriya"
    | "milliy-sertifikat"
    | "olimpiadaga-kirish";
  courseName: string;
  sectionTitle: string;
  duration?: string;
  bookmarkedAt: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ChatMessage {
  id: number;
  text: string;
  senderType: 0 | 1;
  createdAt: Date;
  isRead: boolean;
  isSent: boolean; // true if sent by user, false if received
}

export interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;

  // Primary colors
  primary: string;
  primarySecondary: string;
  primaryLight: string;
  primaryDark: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border and divider colors
  border: string;
  divider: string;

  // Input colors
  inputBackground: string;
  inputBorder: string;
  placeholder: string;

  // Shadow colors
  shadow: string;

  // Navigation colors
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;

  ripple: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

export type ThemeMode = "light" | "dark" | "system";

export type RootStackParamList = {
  MainTabs: undefined;
  CoursesList: undefined;
  SubjectScreen: { subjectId: number; subjectName: string };
  Algebra: undefined;
  Geometriya: undefined;
  MilliySertifikat: undefined;
  PurchaseSubject: undefined;
  PurchaseSubjectTheme: undefined;
  Checkout: undefined;
  CreditCardScreen: undefined;
  OTPCardVerification: { orderId: string; phoneNumber: string };
  Chat: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: {
    themeId: number;
    themeName: string;
    themeOrdinalNumber: string;
  };
  VideoPlayer: { lessonTitle: string; videoFileId: string; mavzu: string };
  PDFViewer: { pdfPath: string; title?: string; mavzu: string };
  QuizScreen: {
    title?: string;
    testId: number;
    mavzu: string;
  };
  QuizResults: {
    testId: number;
    userId: number;
    themeId: number;
  };
  PersonalInfo: undefined;
  PurchaseGroup: undefined;
  Statistika: undefined;
};

export type TabParamList = {
  Courses: undefined;
  News: undefined;
  Save: undefined;
  Profile: undefined;
};

// Subject/Fan related types
export interface Subject {
  id: number;
  name: string;
  descritpion: string | null; // Note: API has typo 'descritpion'
  stateId: number;
  state: string;
  paidThemesCount: number;
  price: number;
}

export interface SubjectsResponse {
  count: number;
  results: Subject[];
}

// Chapter related types
export interface Chapter {
  id: number;
  name: string;
  subjectId: number;
  ordinalNumber: number;
  description: string | null;
  stateId: number;
  state: string;
  subject: string;
}

export interface ChaptersResponse {
  count: number;
  results: Chapter[];
}

// Themes by chapter API types
export interface ChapterTheme {
  id: number;
  name: string;
  chapterId: number;
  ordinalNumber: number;
  descritpion: string | null; // API typo kept as-is
  content: string | null;
  stateId: number;
  percent: number;
  hasAccess: boolean;
  price: number;
  state: string;
  isLocked?: boolean; // Custom property for locked state
  chapter: string;
  hasAbstractFile: boolean;
  hasAnswerVideos: boolean;
  hasTestPdf: boolean;
  questionsWithPhotoCount: number;
  questionsWithVideoCount: number;
  subject: string;
  subjectId: number;
  testFileName: string;
  testId: number;
  totalQuestionCount: number;
  video: string;
}

export interface ChapterWithThemes {
  id: number;
  name: string;
  percent: number;
  ordinalNumber: number;
  subjectId: number;
  subject: string;
  stateId: number;
  state: string;
  hasAccess: boolean;
  themes: ChapterTheme[];
}

export interface ThemesByChapterResponse {
  count: number;
  results: ChapterWithThemes[];
}

export interface ThemeDetail {
  id: number;
  name: string;
  chapterId: number;
  subjectId: number;
  testId: number;
  ordinalNumber: number;
  descritpion: string | null;
  content: string | null;
  chapter: string;
  subject: string;
  stateId: number;
  state: string;
  video: {
    id: number;
    fileId: string;
    stateId: number;
    state: string;
  };
}

// Quiz/Test related types
export interface AnswerKey {
  id: number;
  questionNumber: number;
  dbQuestionNumber: number;
  partIndex: number;
  subTestNo: number;
  partLabel: string | null;
  correctAnswer: string;
  testPhotos: {
    fileId: string;
    relativePath: string;
  }[];
  answerType: number; // 0 for text, 1 for multiple choice
  options: string | null; // JSON string of options array
  points: number;
  videoFileId: string | null;
}

export interface ThemeTest {
  id: number;
  themeId: number;
  fileName: string;
  originalName: string;
  questionCount: number;
  testTypeId: number;

  answerKeys: AnswerKey[];
}

export interface QuizAnswer {
  questionNumber: number;
  partIndex: number;
  answer: string;
}

export interface QuizSubmissionRequest {
  testId: number;
  userId: number;
  answers: QuizAnswer[];
}

export interface QuizResult {
  id?: number;
  testId: number;
  userId: number;
  score?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  percentage?: number;
  completedAt?: string;
}

// Quiz Results API types
export interface QuizResultAnswer {
  questionNumber: number;
  dbQuestionNumber: number;
  answerFileId: string;
  partLabel: string;
  photos: {
    fileId: string;
    relativePath: string;
  }[];
  answerKeyId: number;
  partIndex: number;
  answer: string;
  subTestNo: number;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResultData {
  id: number;
  testId: number;
  userId: number;
  percent: number;
  maxScore: number;
  answers: QuizResultAnswer[];
  score: number;
}

export interface QuizResultsResponse extends Array<QuizResultData> {}
// News types
export interface NewsItem {
  id: number;
  title: string;
  body: string;
  newsType: number;
  scopeType: number;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  publishedAt: string | null;
}

export interface NewsResponse {
  items: NewsItem[];
  total: number;
}

// Statistics types
export interface SubjectStatistic {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  correctSum: number;
  totalSum: number;
  percent: number;
}

export interface StatisticsResponse extends Array<SubjectStatistic> {}

//theme statistics
export interface ChapterThemeStatistic {
  id: number;
  testId: number;
  name: string;
  chapterId: number;
  ordinalNumber: number;
  stateId: number;
  state: string;
  percent: number;
  isLocked: boolean;
}

export interface ChapterWithThemesStatistic {
  id: number;
  name: string;
  ordinalNumber: number;
  subjectId: number;
  subject: string;
  stateId: number;
  state: string;
  themes: ChapterThemeStatistic[];
}

//theme test statistics
export interface ThemeTestStatisticWrongAnswers {
  subTestNo: number;
  dbQuestionNumber: number;
  partLabel: string;
  questionNumber: number;
}
export interface ThemeTestStatistic {
  testId: number;
  name: string;
  score: number;
  percent: number;
  correct: number;
  wrong: number;
  total: number;
  wrongOrUnsolvedNumbers: ThemeTestStatisticWrongAnswers[];
}
//orders
export interface OrderItem {
  id: number;
  userId: number;
  scopeTypeId: number;
  scopeId: number;
  periodDays: number;
  price: number;
  currency: string;
  statusId: number;
  createdAt: string;
  paidAt: null;
  scopeType: string;
  status: string;
  user: string;
}

export interface OrderResponse {
  results: OrderItem[];
  count: number;
}

export interface SubscriptionPlanFeature {
  id: number;
  code: string;
  name: string;
  description: string;
}
export interface SubscriptionPlanOption {
  id: number;
  periodId: number;
  price: number;
  stateId: number;
  periodCode: string;
  periodDurationValue: number;
  periodDurationUnit: string;
  annualDiscountPercent: number;
  state: string;
}

export interface UserSubscription {
  id: number;
  userId: number;
  planId: number;
  startAt: string;
  endAt: string;
  statusId: number;
  replacedById: number | null;
  sourceOrderId: number;
  createdAt: string;
  user: string;
  userName: string;
  remainingDays: number;
  remainingAmount: number;
  plan: {
    id: number;
    tierId: number;
    periodId: number;
    price: number;
    stateId: number;
    periodCode: string;
    periodDurationValue: number;
    periodDurationUnit: string;
    state: string;
    tier: string;
    tierCode: string;
    subscriptionFeatures: {
      id: number;
      code: string;
      name: string;
      description: string;
    }[];
  };
}
export interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  description: string;
  stateId: number;
  state: string;
  features: SubscriptionPlanFeature[];
  plans: SubscriptionPlanOption[];
}

export interface VideoSource {
  uri: string;
  type?: string;
  headers?: { [key: string]: string };
}

export interface VideoPlayerProps {
  source: VideoSource;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  onBackPress?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

export interface VideoState {
  paused: boolean;
  fullscreen: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  showControls: boolean;
  loading: boolean;
  showSettings: boolean;
  volume: number;
  muted: boolean;
  buffering: boolean;
  seeking: boolean;
  seekPosition: number;
}

export interface ControlActions {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  toggleFullscreen: () => void;
  changePlaybackRate: (rate: number) => void;
  toggleMute: () => void;
  changeVolume: (volume: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  showControls: (show: boolean) => void;
}

export interface PlaybackRateOption {
  label: string;
  value: number;
  icon: string;
}
