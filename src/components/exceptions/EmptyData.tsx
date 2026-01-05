import { View, Text, StyleSheet, Dimensions } from "react-native";
import React, { memo, useRef } from "react";
import { Theme } from "@/src/types";
import { useTheme } from "@/src/context/ThemeContext";
import LottieView from "lottie-react-native";

const windowWidth = Dimensions.get("window").width;
function EmptyData() {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const animation = useRef<LottieView>(null);
  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: windowWidth - 50,
          height: windowWidth - 50,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require("../../../assets/lotties/emptydata.json")}
      />
      <Text style={styles.title}>Ma’lumot topilmadi</Text>
      <Text style={styles.description}>
        Hozircha ko‘rsatish uchun hech qanday ma’lumot mavjud emas
      </Text>
    </View>
  );
}

export default memo(EmptyData);

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
  });
