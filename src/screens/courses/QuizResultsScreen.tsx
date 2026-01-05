import { useTheme } from "@/src/context/ThemeContext";
import { useQuizResults } from "@/src/hooks/useQuiz";
import { QuizResultsResponse, Theme } from "@/src/types";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

export default function QuizResultsScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { testId, userId, themeId, mavzu } = route.params;
  const {
    data: quizResults,
    isLoading: resultsLoading,
    error: resultsError,
  } = useQuizResults(Number(userId), Number(themeId));

  const groupedTestData = useMemo(() => {
    if (!quizResults) return [];

    return Object.entries(
      quizResults[0].answers
        .filter((item) => !item.isCorrect)
        .reduce((acc: any, key: any) => {
          const group = acc[key.subTestNo] || [];
          group.push(key);
          acc[key.subTestNo] = group;
          return acc;
        }, {})
    );
  }, [quizResults]);

  const handleFinish = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "MainTabs",
          state: {
            routes: [
              {
                name: "Courses",
                state: {
                  routes: [{ name: "CoursesList" }],
                },
              },
            ],
          },
        },
      ],
    });
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleFinish();
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "IDS mavzulashtirilgan testlar to'plami",
      headerTitle: () => (
        <View style={headerRightStyles.container}>
          <Text style={styles.headerTitle}>IDS mavzulashtirilgan testlar to'plami</Text>
        </View>
      ),
      freezeOnBlur: true,
      headerRight: () => null,
      headerLeft: () => <Text></Text>,
    });
  }, [navigation]);
  if (resultsLoading)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Natijalar yuklanmoqda...</Text>
      </SafeAreaView>
    );

  if (resultsError || !quizResults)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={theme.colors.error}
        />
        <Text style={styles.errorTitle}>Natijalar topilmadi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleFinish}>
          <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Circle */}
          <View style={styles.percentageCircle}>
            <Text style={styles.percentageText}>
              {quizResults[0].percent.toFixed(0)}%
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsBox}>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>To'g'ri:</Text>
              <Text style={styles.statsValue}>{quizResults[0].score} ta</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Noto'g'ri:</Text>
              <Text style={styles.statsValue}>
                {quizResults[0].maxScore - quizResults[0].score} ta
              </Text>
            </View>
          </View>

          {/* Wrong list */}
          <View style={styles.wrongBox}>
            <Text style={styles.wrongTitle}>
              Xato yoki ishlanmagan misollar:
            </Text>
            <View style={styles.wrongNumbers}>
              {groupedTestData.map(([subTestNo, questions]) => {
                return (
                  <View key={subTestNo}>
                    <Text
                      style={{
                        fontSize: moderateScale(16),
                        marginBottom: moderateScale(8),
                        color: theme.colors.text,
                      }}
                    >
                      Test {subTestNo}
                    </Text>
                    <View
                      style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}
                    >
                      {(questions as QuizResultsResponse[0]["answers"]).map(
                        (num, index) => (
                          <View key={index} style={styles.badge}>
                            <Text style={styles.badgeText}>
                              {num.questionNumber}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
            <Text style={styles.encouragement}>
              Ushbu misollarni qayta yechishni tavsiya qilamiz!
            </Text>
          </View>

          {/* Buttons */}
        </View>
      </ScrollView>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => {
            navigation.navigate("QuizSolution", {
              userId,
              testId,
              themeId,
              mavzu,
            });
            // router.navigate({
            //   pathname: "/(root)/lesson/lessondetail/quiz/solution",
            //   params: {
            //     userId,
            //     testId,
            //     themeId,
            //     mavzu,
            //   },
            // });
          }}
        >
          <Ionicons name="eye-outline" size={moderateScale(20)} color={theme.colors.primary} />
          <Text style={styles.outlineText}>Natijani ko‘rish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleFinish}
        >
          <Ionicons name="checkmark-circle" size={moderateScale(20)} color="white" />
          <Text style={styles.primaryText}>Yakunlash</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const headerRightStyles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(BORDER_RADIUS.sm),
    minWidth: moderateScale(50),
    alignItems: "center",
  },
  text: {
    fontSize: moderateScale(FONT_SIZES.sm),
    color: COLORS.white,
    fontWeight: "500",
  },
});
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
   
    headerTitle: {
      fontSize: moderateScale(FONT_SIZES.lg),
      color: COLORS.white,
      fontWeight: "500",
    },
    headerSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: "white",
      opacity: 0.8,
    },
    content: {
      flex: 1,
      alignItems: "center",
      padding: SPACING.lg,
    },
    percentageCircle: {
      width: moderateScale(150),
      height: moderateScale(150),
      borderRadius: moderateScale(75),
      borderWidth: moderateScale(4),
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      marginBottom: moderateScale(SPACING.xl),
    },
    percentageText: {
      fontSize: moderateScale(42),
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    statsBox: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(BORDER_RADIUS.base),
      padding: moderateScale(SPACING.sm),
      marginBottom: moderateScale(SPACING.lg),
      width: "100%",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: moderateScale(SPACING.xs),
    },
    statsLabel: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
    },
    statsValue: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: theme.colors.text,
    },
    wrongBox: {
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(BORDER_RADIUS.base),
      padding: moderateScale(SPACING.base),
      marginBottom: moderateScale(SPACING.lg),
      width: "100%",
    },
    wrongTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: moderateScale(SPACING.xs),
    },
    wrongNumbers: {
      flexDirection: "column",
      gap: SPACING.xs,
    },
    badge: {
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.error + "20",
      borderRadius: moderateScale(BORDER_RADIUS.sm),
      paddingHorizontal: moderateScale(SPACING.sm),
      paddingVertical: moderateScale(SPACING.xs),
    },
    badgeText: {
      fontSize: moderateScale(FONT_SIZES.xs),
      color: theme.colors.error,
      fontWeight: "600",
    },
    encouragement: {
      fontSize: moderateScale(FONT_SIZES.base),
      textAlign: "center",
      color: theme.colors.text,
      marginTop: moderateScale(SPACING.sm),
      fontStyle: "italic",
    },
    actions: {
      flexDirection: "row",
      paddingHorizontal: moderateScale(SPACING.base),
      width: "100%",
      gap: SPACING.base,
      marginTop: moderateScale(12),
      marginBottom: moderateScale(SPACING.xl),
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: moderateScale(12),
      borderRadius: moderateScale(BORDER_RADIUS.base),
      gap: moderateScale(SPACING.xs),
    },
    outlineButton: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    outlineText: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontSize: moderateScale(FONT_SIZES.base),
    },
    primaryText: {
      color: "white",
      fontWeight: "600",
      fontSize: moderateScale(FONT_SIZES.base),
    },
    loadingText: {
      marginTop: SPACING.base,
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
    },
    errorTitle: {
      fontSize: moderateScale(FONT_SIZES.xl),
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: SPACING.base,
      textAlign: "center",
    },
    retryButton: {
      marginTop: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.base,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    retryButtonText: {
      color: theme.colors.primary,
      fontWeight: "600",
      fontSize: FONT_SIZES.base,
    },
  });
