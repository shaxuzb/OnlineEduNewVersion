import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";
import { SPACING, FONT_SIZES, BORDER_RADIUS } from "../../utils";
import { useQuizResults, useThemeTest } from "../../hooks/useQuiz";

export default function QuizResultsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { testId, userId, themeId, mavzu } = (route.params as any) || {};

  // API
  const {
    data: quizResults,
    isLoading: resultsLoading,
    error: resultsError,
  } = useQuizResults(userId, themeId);
  const { data: testData, isLoading: testLoading } = useThemeTest(testId);

  const latestResult = quizResults?.[0];
  const totalQuestions = testData?.questionCount || 0;
  const score = latestResult?.score || 0;
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const wrongAnswers = totalQuestions - score;

  // ❌ Find incorrect & unanswered
  const wrongQuestionNumbers: number[] = [];
  if (latestResult && testData) {
    const allQuestions = Array.from(
      { length: totalQuestions },
      (_, i) => i + 1
    );
    const answered = latestResult.answers.map((a) => a.questionNumber);
    const unanswered = allQuestions.filter((q) => !answered.includes(q));
    const incorrect = latestResult.answers
      .filter((a) => {
        const correct = testData.answerKeys.find(
          (ak) => ak.questionNumber === a.questionNumber
        );
        return correct && correct.correctAnswer !== a.answer;
      })
      .map((a) => a.questionNumber);

    wrongQuestionNumbers.push(...incorrect, ...unanswered);
  }

  const resultsData = {
    totalQuestions,
    correctAnswers: score,
    wrongAnswers,
    percentage,
    wrongQuestionNumbers: wrongQuestionNumbers.sort((a, b) => a - b),
    mavzu: mavzu || "Test",
  };

  const handleFinish = () =>
    (navigation as any).navigate("MainTabs", {
      screen: "Courses",
      params: { screen: "CoursesList" },
    });

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

  if (resultsLoading || testLoading)
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Natijalar yuklanmoqda...</Text>
      </SafeAreaView>
    );

  if (resultsError || !latestResult)
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{resultsData.mavzu}</Text>
        <Text style={styles.headerSubtitle}>Natija</Text>
      </View>

      {/* Body */}
      <View style={styles.content}>
        {/* Circle */}
        <View style={styles.percentageCircle}>
          <Text style={styles.percentageText}>{resultsData.percentage}%</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsBox}>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>To'g'ri:</Text>
            <Text style={styles.statsValue}>
              {resultsData.correctAnswers} ta
            </Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Noto'g'ri:</Text>
            <Text style={styles.statsValue}>{resultsData.wrongAnswers} ta</Text>
          </View>
        </View>

        {/* Wrong list */}
        <View style={styles.wrongBox}>
          <Text style={styles.wrongTitle}>Xato yoki ishlanmagan misollar:</Text>
          <View style={styles.wrongNumbers}>
            {resultsData.wrongQuestionNumbers.map((num) => (
              <View key={num} style={styles.badge}>
                <Text style={styles.badgeText}>{num}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.encouragement}>
            Ushbu misollarni qayta yechishni tavsiya qilamiz!
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={() => {
              (navigation as any).navigate("QuizSolution", {
                userId,
                testId,
                themeId,
              });
            }}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={styles.outlineText}>Natijani ko‘rish</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleFinish}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.primaryText}>Yakunlash</Text>
          </TouchableOpacity>
        </View>
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
    centerContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingVertical: SPACING.base,
    },
    headerTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "bold",
      color: "white",
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
      width: 150,
      height: 150,
      borderRadius: 75,
      borderWidth: 4,
      borderColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      marginBottom: SPACING.xl,
    },
    percentageText: {
      fontSize: 48,
      fontWeight: "bold",
      color: theme.colors.primary,
    },
    statsBox: {
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.base,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      width: "100%",
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: SPACING.sm,
    },
    statsLabel: {
      fontSize: FONT_SIZES.lg,
      color: theme.colors.text,
    },
    statsValue: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    wrongBox: {
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.base,
      padding: SPACING.lg,
      marginBottom: SPACING.xl,
      width: "100%",
    },
    wrongTitle: {
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: SPACING.base,
    },
    wrongNumbers: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
    },
    badge: {
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.error + "20",
      borderRadius: BORDER_RADIUS.sm,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    badgeText: {
      fontSize: FONT_SIZES.sm,
      color: theme.colors.error,
      fontWeight: "600",
    },
    encouragement: {
      fontSize: FONT_SIZES.base,
      textAlign: "center",
      color: theme.colors.text,
      marginTop: SPACING.sm,
      fontStyle: "italic",
    },
    actions: {
      flexDirection: "row",
      width: "100%",
      gap: SPACING.base,
      marginTop: "auto",
      marginBottom: SPACING.xl,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.base,
      gap: SPACING.xs,
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
      fontSize: FONT_SIZES.base,
    },
    primaryText: {
      color: "white",
      fontWeight: "600",
      fontSize: FONT_SIZES.base,
    },
    loadingText: {
      marginTop: SPACING.base,
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
    },
    errorTitle: {
      fontSize: FONT_SIZES.xl,
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
