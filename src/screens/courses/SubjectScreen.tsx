import EmptyData from "@/src/components/exceptions/EmptyData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemes } from "@/src/hooks/useThemes";
import { ChapterTheme, Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PurchaseModal from "../purchases/components/PurchaseModal";
import PageCard from "@/src/components/ui/cards/PageCard";
import { moderateScale } from "react-native-size-matters";

export default function SubjectScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const styles = createStyles(theme);

  const { subjectId, subjectName, percent } = route.params;

  const { data, isLoading, isError, refetch } = useThemes(Number(subjectId));

  const handleThemePress = (chapterTheme: ChapterTheme) => {
    if (chapterTheme.hasAccess) {
      navigation.navigate("LessonDetail", {
        themeId: chapterTheme.id,
        percent: chapterTheme.percent,
        themeOrdinalNumber: chapterTheme.ordinalNumber,
        themeName: chapterTheme.name,
      });
    } else {
      setVisible(true);
    }
  };
  const handlePurchase = () => {
    navigation.navigate("PurchaseGroup", {
      screen: "PurchaseSubjectTheme",
      params: {
        subjectId: subjectId,
        subjectName: subjectName,
      },
    });
    setVisible(false);
  };
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: subjectName.toString(),
      freezeOnBlur: true,

      headerRight: () => (
        <Text
          style={{
            color: "white",
            fontSize: moderateScale(16),
            fontWeight: "500",
          }}
        >
          {percent}%
        </Text>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <PageCard>
        {isLoading ? (
          <LoadingData />
        ) : isError ? (
          <ErrorData refetch={refetch} />
        ) : data && data.results.length > 0 ? (
          <SectionList
            sections={
              data?.results?.map((chapter) => ({
                title: `${chapter.ordinalNumber}-bob. ${chapter.name}`,
                data: chapter.themes,
              })) ?? []
            }
            keyExtractor={(item, index) => item.id.toString() + index}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.chapterSectionTitle}>{title}</Text>
            )}
            renderItem={({ item: chapterTheme }) => (
              <TouchableOpacity
                key={chapterTheme.id}
                style={[
                  styles.themeCard,
                  !chapterTheme.hasAccess && styles.lockedThemeCard,
                ]}
                activeOpacity={0.8}
                onPress={() => handleThemePress(chapterTheme)}
              >
                <View style={styles.themeLeft}>
                  <View style={styles.lockIconContainer}>
                    <Ionicons
                      name={
                        chapterTheme.hasAccess ? "lock-closed" : "lock-open"
                      }
                      size={moderateScale(16)}
                      color={
                        !chapterTheme.hasAccess
                          ? theme.colors.textMuted
                          : theme.colors.success
                      }
                    />
                  </View>
                  <View style={styles.themeInfo}>
                    <Text style={styles.themeNumber}>
                      {chapterTheme.ordinalNumber}-mavzu:
                    </Text>
                    <Text
                      style={[
                        styles.themeName,
                        !chapterTheme.hasAccess && styles.lockedThemeName,
                      ]}
                      numberOfLines={2}
                    >
                      {chapterTheme.name}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.loadingText}>
                      {chapterTheme.percent}%
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={2}
            scrollEnabled
            contentContainerStyle={styles.content}
          />
        ) : (
          <EmptyData />
        )}
        <PurchaseModal
          visible={visible}
          onClose={() => setVisible(false)}
          onPurchase={handlePurchase}
        />
      </PageCard>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      padding: 11,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    profileBtn: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 50,
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 12,
    },
    retryBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryText: {
      color: "white",
      fontWeight: "600",
    },
    chapterCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    chapterLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    chapterInfo: {
      flex: 1,
    },
    chapterTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    chapterName: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 4,
    },
    themeCount: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    chapterContainer: {
      marginBottom: 8,
    },
    chapterRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    themesContainer: {
      marginLeft: 16,
      marginRight: 16,
      marginBottom: 12,
    },
    themeCard: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(12),
      padding: moderateScale(16),
      marginBottom: moderateScale(12),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    lockedThemeCard: {
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
    },
    themeLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    lockIconContainer: {
      marginRight: 12,
    },
    themeNumber: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    themeInfo: {
      flex: 1,
    },
    themeName: {
      fontSize: moderateScale(16),
      color: theme.colors.text,
      lineHeight: 20,
      flexShrink: 1,
    },
    lockedThemeName: {
      color: theme.colors.textMuted,
    },
    chapterSectionTitle: {
      fontSize: moderateScale(18),
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
  });
