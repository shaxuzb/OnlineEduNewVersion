import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { CoursesStackNavigator } from './CoursesStackNavigator';
import NewsScreen from '../screens/news/NewsScreen';
import SaveScreen from '../screens/save/SaveScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'Courses') {
              iconName = focused ? 'library' : 'library-outline';
            } else if (route.name === 'News') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Save') {
              iconName = focused ? 'bookmark' : 'bookmark-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Courses" 
          component={CoursesStackNavigator} 
          options={{ tabBarLabel: 'Courses' }}
        />
        <Tab.Screen 
          name="News" 
          component={NewsScreen} 
          options={{ tabBarLabel: 'News' }}
        />
        <Tab.Screen 
          name="Save" 
          component={SaveScreen} 
          options={{ tabBarLabel: 'Save' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ tabBarLabel: 'Profil' }}
        />
      </Tab.Navigator>
);

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen (splash screen) while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      {isAuthenticated ? (
        <MainTabNavigator />
      ) : (
        <LoginScreen />
      )}
    </NavigationContainer>
  );
}
