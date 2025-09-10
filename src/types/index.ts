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
  courseType: 'algebra' | 'geometriya' | 'milliy-sertifikat' | 'olimpiadaga-kirish';
  courseName: string;
  sectionTitle: string;
  duration?: string;
  bookmarkedAt: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export type RootStackParamList = {
  MainTabs: undefined;
  CoursesList: undefined;
  Algebra: undefined;
  Geometriya: undefined;
  CourseDetail: { courseId: string };
  LessonDetail: { lessonId: number; lessonTitle: string; mavzu: string };
  VideoPlayer: { lessonTitle: string; mavzu: string };
  PDFViewer: { pdfPath: string; title?: string; mavzu: string };
  QuizScreen: { pdfPath: string; title?: string; mavzu: string };
  QuizResults: { 
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    percentage: number;
    wrongQuestionNumbers: number[];
    mavzu: string;
  };
  Statistika: undefined;
};

export type TabParamList = {
  Courses: undefined;
  News: undefined;
  Save: undefined;
  Profile: undefined;
};
