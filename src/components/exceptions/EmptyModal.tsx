import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import React, { FC, memo, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/context/ThemeContext";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import { Theme } from "@/src/types";
import LottieView from "lottie-react-native";
// import LottieView from "lottie-react-native";

interface EmptyModalProps {
  visible: boolean;
  onBack: () => void;
  title?: string;
  description?: string;
}

const windowWidth = Dimensions.get("window").width;
const EmptyModal: FC<EmptyModalProps> = ({
  visible,
  onBack,
  title = "Hozircha mavjud emas",
  description = "Test hali yuklanmagan. Yuklanganda sizga xabar beramiz.",
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const animation = useRef<LottieView>(null);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Animation */}
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: 150,
              height: 150,
            }}
            // Find more Lottie files at https://lottiefiles.com/featured
            source={require("../../../assets/lotties/emptydata.json")}
          />

          {/* Text */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* Back Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onBack}
            style={styles.button}
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.buttonText}>Orqaga</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default memo(EmptyModal);

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      alignItems: "center",
      justifyContent: "center",
      padding: SPACING.lg,
    },

    card: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: theme.colors.card ?? "#fff",
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.xl,
      alignItems: "center",
    },
    title: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: SPACING.xs,
    },

    description: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.textSecondary ?? "#777",
      textAlign: "center",
      marginBottom: SPACING.lg,
      lineHeight: 20,
    },

    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.sm + 2,
      borderRadius: BORDER_RADIUS.sm,
    },

    buttonText: {
      color: "#fff",
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
    },
  });
