import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  showLabels?: boolean;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabels = true, 
  style 
}) => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = createStyles(theme);

  const themeOptions: { mode: ThemeMode; label: string; icon: string }[] = [
    { mode: 'light', label: 'Yorug\'', icon: 'sunny' },
    { mode: 'dark', label: 'Qorong\'u', icon: 'moon' },
    { mode: 'system', label: 'Tizim', icon: 'phone-portrait' },
  ];

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  if (showLabels) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>Mavzu</Text>
        <View style={styles.optionsContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.option,
                themeMode === option.mode && styles.selectedOption,
              ]}
              onPress={() => handleThemeChange(option.mode)}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={
                  themeMode === option.mode 
                    ? 'white' 
                    : theme.colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.optionText,
                  themeMode === option.mode && styles.selectedOptionText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Compact toggle for header/toolbar
  return (
    <TouchableOpacity
      style={[styles.compactToggle, style]}
      onPress={() => {
        const currentIndex = themeOptions.findIndex(opt => opt.mode === themeMode);
        const nextIndex = (currentIndex + 1) % themeOptions.length;
        handleThemeChange(themeOptions[nextIndex].mode);
      }}
    >
      <Ionicons
        name={
          themeMode === 'light' ? 'sunny' : 
          themeMode === 'dark' ? 'moon' : 
          'phone-portrait'
        }
        size={24}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  compactToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
