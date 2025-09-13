import { Theme, ThemeColors } from '../types';

// Light theme colors
export const lightColors: ThemeColors = {
  // Background colors
  background: '#f3f4f6',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#1f2937',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  
  // Primary colors
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Border and divider colors
  border: '#e5e7eb',
  divider: '#f3f4f6',
  
  // Input colors
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  placeholder: '#9ca3af',
  
  // Shadow colors
  shadow: '#000000',
  
  // Navigation colors
  tabBarBackground: '#ffffff',
  tabBarActive: '#3b82f6',
  tabBarInactive: '#6b7280',
};

// Dark theme colors
export const darkColors: ThemeColors = {
  // Background colors
  background: '#111827',
  surface: '#1f2937',
  card: '#374151',
  
  // Text colors
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  
  // Primary colors
  primary: '#60a5fa',
  primaryLight: '#93c5fd',
  primaryDark: '#3b82f6',
  
  // Status colors
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#22d3ee',
  
  // Border and divider colors
  border: '#4b5563',
  divider: '#374151',
  
  // Input colors
  inputBackground: '#374151',
  inputBorder: '#6b7280',
  placeholder: '#9ca3af',
  
  // Shadow colors
  shadow: '#000000',
  
  // Navigation colors
  tabBarBackground: '#1f2937',
  tabBarActive: '#60a5fa',
  tabBarInactive: '#9ca3af',
};

// Theme objects
export const lightTheme: Theme = {
  colors: lightColors,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  isDark: true,
};

// Common styles that work with both themes
export const commonStyles = {
  // Border radius values
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    full: 50,
  },
  
  // Spacing values
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Shadow configurations
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
  },
};
