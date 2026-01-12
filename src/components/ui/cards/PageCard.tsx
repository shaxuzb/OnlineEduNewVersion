import { View, Text } from "react-native";
import React, { ReactNode } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { moderateScale } from "react-native-size-matters";

export default function PageCard({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: "#3a5dde" }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          borderTopEndRadius: moderateScale(18),
          borderTopStartRadius: moderateScale(18),
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}
