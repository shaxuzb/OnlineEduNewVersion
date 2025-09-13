import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode } from '../types';
import { lightTheme, darkTheme } from '../constants/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Calculate the current theme based on mode and system preference
  const getCurrentTheme = (mode: ThemeMode, systemScheme: ColorSchemeName): Theme => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  };

  const [theme, setTheme] = useState<Theme>(
    getCurrentTheme(themeMode, systemColorScheme)
  );

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          const mode = savedTheme as ThemeMode;
          setThemeModeState(mode);
          setTheme(getCurrentTheme(mode, systemColorScheme));
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
      if (themeMode === 'system') {
        setTheme(getCurrentTheme('system', colorScheme));
      }
    });

    return () => subscription?.remove();
  }, [themeMode]);

  // Update theme when theme mode changes
  useEffect(() => {
    setTheme(getCurrentTheme(themeMode, systemColorScheme));
  }, [themeMode, systemColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setTheme(getCurrentTheme(mode, systemColorScheme));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = theme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    toggleTheme,
    setThemeMode,
    isDark: theme.isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
