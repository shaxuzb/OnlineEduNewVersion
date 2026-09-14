import React, { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProtectedPdfViewer from "@/src/components/courses/ProtectedPdfViewer";
import { useTheme } from "@/src/context/ThemeContext";
import { Theme } from "@/src/types";
import { RootStackParamList } from "@/src/navigation/rootTypes";

type ThemeAbstractRoute = RouteProp<RootStackParamList, "ThemeAbstract">;
type ThemeAbstractNavigation = NativeStackNavigationProp<
  RootStackParamList,
  "ThemeAbstract"
>;

export default function ThemeAbstractScreen({
  navigation,
}: {
  navigation: ThemeAbstractNavigation;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const route = useRoute<ThemeAbstractRoute>();
  const { themeId, mavzu } = route.params;

  useEffect(() => {
    navigation.setOptions({
      title: mavzu,
      freezeOnBlur: true,
    });
  }, [mavzu, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.pdfContainer}>
        <ProtectedPdfViewer path={`/themeabstract/${themeId}`} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    pdfContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
