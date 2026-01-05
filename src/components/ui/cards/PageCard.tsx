import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { useTheme } from "@/src/context/ThemeContext";

export default function PageCard({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: "#3a5dde" }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderTopEndRadius: 20,
          borderTopStartRadius: 20,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}
