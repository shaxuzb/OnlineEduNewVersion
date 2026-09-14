import type { NavigatorScreenParams } from "@react-navigation/native";
import type { CoursesStackParamList } from "./coursesTypes";

export type MainTabParamList = {
  Courses: NavigatorScreenParams<CoursesStackParamList> | undefined;
  Statistika: undefined;
  Payment: undefined;
  Save: undefined;
  ChatTab: undefined;
};
