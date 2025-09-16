export interface AuthUserData {
  id: number;
  userName: string;
  phoneNumber: string;
  fullName: string;
  role: string;
  roleId: number;
  state: string;
  stateId: number;
  isParent: false;
  modules: number[];
  permissions: string[];
}
export interface AuthToken {
  token: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  completedLessons: number[];
}

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
  id: string;
  text: string;
  timestamp: Date;
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

    Statistika: undefined;
  };
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
  state: string;
  isLocked?: boolean; // Custom property for locked state
}

export interface ChapterWithThemes {
  id: number;
  name: string;
  ordinalNumber: number;
  subjectId: number;
  subject: string;
  stateId: number;
  state: string;
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
  partIndex: number;
  partLabel: string | null;
  correctAnswer: string;
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
  partIndex: number;
  answer: string;
}

export interface QuizResultData {
  id: number;
  testId: number;
  userId: number;
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
