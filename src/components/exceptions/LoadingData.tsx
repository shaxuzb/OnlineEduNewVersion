import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import React, { memo } from "react";
import { COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";

function LoadingData() {
    const { theme } = useTheme();
      const styles = createStyles(theme);
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Yuklanmoqda...</Text>
    </View>
  );
}
export default memo(LoadingData);
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    loadingContainer: {
         flex: 1,
         justifyContent: "center",
         alignItems: "center",
         height: "100%",
       },
       loadingText: {
         marginTop: SPACING.base,
         fontSize: FONT_SIZES.base,
         color: COLORS.text,
       },
  });
