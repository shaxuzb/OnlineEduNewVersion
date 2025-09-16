import { Dimensions } from "react-native";

// Screen dimensions
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

// Colors
export const COLORS = {
  primary: "#3b82f6",
  secondary: "#f3f4f6",
  success: "#10b981",
  warning: "#fbbf24",
  error: "#ef4444",
  text: "#1f2937",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  white: "#ffffff",
  gray: "#f9fafb",
  // Dark mode colors
  dark: {
    background: "#111827",
    surface: "#1f2937",
    surfaceSecondary: "#374151",
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    textMuted: "#9ca3af",
    border: "#374151",
  },
  // Light mode colors
  light: {
    background: "#ffffff",
    surface: "#f9fafb",
    surfaceSecondary: "#f3f4f6",
    text: "#1f2937",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",
    border: "#e5e7eb",
  },
};

// Typography
export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 8,
  base: 12,
  lg: 16,
  full: 50,
};

// Helper functions
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
};
