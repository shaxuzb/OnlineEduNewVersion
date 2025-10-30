import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React, { FC, memo, useMemo } from "react";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/src/types";
interface ErrorDataProps {
  refetch: () => void;
}
const ErrorData: FC<ErrorDataProps> = ({ refetch }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.refreshSection}>
      <Text style={styles.errorText}>
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </Text>
      <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
        <Ionicons name="refresh" size={20} color="white" />
        <Text style={styles.refreshButtonText}>Qayta yuklash</Text>
      </TouchableOpacity>
    </View>
  );
};
export default memo(ErrorData);
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    refreshSection: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    errorText: {
      marginBottom: SPACING.base,
      fontSize: FONT_SIZES.base,
      color: "red",
    },
    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      gap: SPACING.xs,
    },
    refreshButtonText: {
      color: "white",
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
    },
  });
