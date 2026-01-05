import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { FC, memo, useRef } from "react";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/src/types";
import LottieView from "lottie-react-native";

interface ErrorDataProps {
  refetch: () => void;
}

const windowWidth = Dimensions.get("window").width;

const ErrorData: FC<ErrorDataProps> = ({ refetch }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const animation = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animation}
        autoPlay
        loop
        style={styles.animation}
        source={require("../../../assets/lotties/errordata.json")}
      />

      <Text style={styles.title}>Xatolik yuz berdi</Text>
      <Text style={styles.subtitle}>
        Ma’lumotlarni yuklashda muammo chiqdi. Iltimos, qayta urinib ko‘ring.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={refetch}
        style={styles.button}
      >
        <Ionicons name="refresh-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Qayta yuklash</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(ErrorData);

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: SPACING.xl,
      alignItems: "center",
      justifyContent: "center",
    },

    animation: {
      width: windowWidth * 0.7,
      height: windowWidth * 0.7,
      marginBottom: SPACING.lg,
    },

    title: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
      textAlign: "center",
    },

    subtitle: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textSecondary ?? "#888",
      textAlign: "center",
      marginBottom: SPACING.lg,
      lineHeight: 20,
    },

    button: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.lg,
      gap: SPACING.sm,

      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },

    buttonText: {
      color: "#fff",
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
    },
  });
