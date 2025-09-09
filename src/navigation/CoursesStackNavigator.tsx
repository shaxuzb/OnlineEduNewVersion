import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/courses/HomeScreen';
import AlgebraScreen from '../screens/courses/AlgebraScreen';
import GeometriyaScreen from '../screens/courses/GeometriyaScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
import LessonDetailScreen from '../screens/courses/LessonDetailScreen';
import VideoPlayerScreen from '../screens/courses/VideoPlayerScreen';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function CoursesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="CoursesList" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Algebra" 
        component={AlgebraScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Geometriya" 
        component={GeometriyaScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={{ title: 'Kurs Detayı' }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
