import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { useTheme } from "../../context/ThemeContext";
import { MockTestChapter, Theme } from "../../types";
import { getMockTestCardMeta } from "./mockTestCardUtils";

interface MockTestCardProps {
  chapter: MockTestChapter;
  onPress: () => void;
}

const MockTestCard = memo(({ chapter, onPress }: MockTestCardProps) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const meta = getMockTestCardMeta(chapter);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${meta.title}${meta.hasAccess ? "" : ", premium mock test"}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !meta.hasAccess && styles.premiumCard,
        pressed && styles.cardPressed,
      ]}
    >
      {!meta.hasAccess && (
        <View pointerEvents="none" style={styles.premiumCrown}>
          <FontAwesome6 name="crown" size={moderateScale(18)} color="#FFD700" />
        </View>
      )}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.iconContainer,
            !meta.hasAccess && styles.premiumIconContainer,
          ]}
        >
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={moderateScale(27)}
            color={meta.hasAccess ? theme.colors.primary : "#D99A00"}
          />
        </View>
        <View style={styles.titleBlock}>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>MOCK TEST</Text>
            {/* {!meta.hasAccess && (
              <Ionicons name="lock-closed" size={moderateScale(15)} color="#d99a00" />
            )} */}
          </View>
          <Text style={styles.title} numberOfLines={2}>
            {meta.title}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={moderateScale(21)} color={theme.colors.textMuted} />
      </View>
    </Pressable>
  );
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(18),
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: moderateScale(15),
      marginBottom: moderateScale(12),
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
      position: "relative",
    },
    premiumCard: {
      borderColor: "#E4C66D",
    },
    cardPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.99 }],
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: moderateScale(48),
      height: moderateScale(48),
      borderRadius: moderateScale(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primaryLight,
      marginRight: moderateScale(12),
    },
    premiumIconContainer: {
      backgroundColor: "rgba(217, 154, 0, 0.12)",
    },
    titleBlock: {
      flex: 1,
      paddingRight: moderateScale(22),
    },
    badgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: moderateScale(6),
      marginBottom: moderateScale(4),
    },
    badge: {
      color: theme.colors.primary,
      fontSize: moderateScale(10),
      fontWeight: "800",
      letterSpacing: 0.6,
    },
    title: {
      color: theme.colors.text,
      fontSize: moderateScale(16),
      fontWeight: "700",
      lineHeight: moderateScale(21),
    },
    premiumCrown: {
      position: "absolute",
      top: moderateScale(-10),
      right: moderateScale(-2),
      zIndex: 1,
      elevation: 2,
    },
  });

export default MockTestCard;
