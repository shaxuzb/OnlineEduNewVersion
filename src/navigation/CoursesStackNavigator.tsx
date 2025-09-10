import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/courses/HomeScreen';
import AlgebraScreen from '../screens/courses/AlgebraScreen';
import GeometriyaScreen from '../screens/courses/GeometriyaScreen';
import CourseDetailScreen from '../screens/courses/CourseDetailScreen';
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
    </Stack.Navigator>
  );
}
