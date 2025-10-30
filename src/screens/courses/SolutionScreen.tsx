import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Pdf from "react-native-pdf";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../../utils";
import { Theme } from "@/src/types";
import { useTestPdf, useQuizResults, useThemeTest } from "../../hooks/useQuiz";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "@/src/context/ThemeContext";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

interface LocalQuizAnswer {
  questionId: number;
  selectedOption: string | null;
  isConfirmed: boolean;
  isCorrect: boolean;
  correctAnswer: string;
}

export default function SolutionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  // Get params from route
  const { themeId, userId, testId } = route.params as any;

  // API hooks
  const {
    data: quizResults,
    isLoading: resultsLoading,
    isSuccess: resultsSuccess,
    error: resultsError,
  } = useQuizResults(userId, themeId);
  const { data: pdfBlob } = useTestPdf(testId);
  const {
    data: testData,
  } = useThemeTest(testId);
  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState<LocalQuizAnswer | null>(
    null
  );
  const [answers, setAnswers] = useState<LocalQuizAnswer[]>([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [textInputValue, setTextInputValue] = useState(""); // For text input questions
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Derived values
  const totalQuestions = testData?.questionCount || 0;
  const currentAnswerKey = testData?.answerKeys?.find(
    (ak) => ak.questionNumber === currentQuestion
  );
  const isMultipleChoice = currentAnswerKey?.answerType === 1;
  const questionOptions = currentAnswerKey?.options
    ? JSON.parse(currentAnswerKey.options)
    : [];

  useEffect(() => {
    async function loadAuthToken() {
      try {
        // setIsLoading(true);
        const sessionData = await SecureStore.getItemAsync("session");
        if (sessionData) {
          const { token } = JSON.parse(sessionData);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      } finally {
        // setIsLoading(false);
      }
    }

    loadAuthToken();
  }, []);

  // Load saved answer when question changes
  useEffect(() => {
    if (resultsSuccess) {
      setAnswers(
        quizResults[0].answers.map((item) => ({
          correctAnswer: item.correctAnswer,
          isConfirmed: !!item.answer,
          isCorrect: item.isCorrect,
          questionId: item.questionNumber,
          selectedOption: item.answer,
        }))
      );
    }
  }, [resultsSuccess]);
  useEffect(() => {
    const savedAnswer = answers.find((a) => a.questionId === currentQuestion);
    if (savedAnswer) {
      setSelectedOption(savedAnswer);
      if (isMultipleChoice) {
        setTextInputValue("");
      } else {
        setTextInputValue(savedAnswer.selectedOption || "");
      }
    } else {
      setSelectedOption(null);
      setTextInputValue("");
    }
  }, [currentQuestion, answers, isMultipleChoice]);

  const handleLoadComplete = (numberOfPages: number) => {
    console.log("PDF loaded with", numberOfPages, "pages");
  };

  const handleError = (error: any) => {
    Alert.alert(
      "Xatolik",
      "PDF faylni ochishda xatolik yuz berdi. Fayl mavjudligini tekshiring.",
      [{ text: "OK", onPress: handleFinish }]
    );
    console.error("PDF Error:", error);
  };
  const handleFinish = () =>
    (navigation as any).navigate("MainTabs", {
      screen: "Courses",
      params: { screen: "CoursesList" },
    });
  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setShowTestModal(false);
      setCurrentQuestion((prev) => prev + 1);

      // Load saved answer for next question
      const savedAnswer = answers.find(
        (a) => a.questionId === currentQuestion + 1
      );
      setSelectedOption(savedAnswer || null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setShowTestModal(false);
      setCurrentQuestion((prev) => prev - 1);
      // Load saved answer for previous question
      const savedAnswer = answers.find(
        (a) => a.questionId === currentQuestion - 1
      );
      setSelectedOption(savedAnswer || null);
    }
  };

  const handleQuestionNumberPress = () => {
    setShowTestModal(true);
  };

  const handleTestSelect = (testNumber: number) => {
    setCurrentQuestion(testNumber);
    const savedAnswer = answers.find((a) => a.questionId === testNumber);
    setSelectedOption(savedAnswer || null);
    setShowTestModal(false);
  };

  // Show loading state
  if (resultsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Test yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if test data failed to load
  if (resultsError || !testData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorTitle}>Test ma'lumotlari yuklanmadi</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleFinish}>
            <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinish} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{"1-mavzu"}</Text>
          <Text style={styles.headerSubtitle}>Natija</Text>
        </View>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {currentQuestion}/{totalQuestions}
          </Text>
        </View>
      </View>

      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        {pdfBlob && authToken ? (
          <Pdf
            source={{
              uri: `${Constants.expoConfig?.extra?.API_URL}/theme-test/${testId}/pdf`,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              cache: true,
              method: "get",
            }}
            onLoadComplete={handleLoadComplete}
            onError={handleError}
            style={styles.pdf}
            trustAllCerts={false}
            enablePaging={false}
            horizontal={false}
            spacing={0}
            password=""
            scale={1}
            minScale={1}
            maxScale={1}
            // page={currentQuestion}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color={COLORS.primary} />
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.gray} />
            <Text style={styles.errorTitle}>Test topilmadi</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleFinish}>
              <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quiz Controls */}
      <View style={styles.quizControls}>
        {/* Navigation and Answer Options Row */}
        <View style={styles.topControlsRow}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestion === 1 && styles.navButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestion === 1}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentQuestion === 1 ? COLORS.textMuted : COLORS.primary}
            />
            {questionOptions.length !== 6 && (
              <Text style={[styles.navButtonText]}>Back</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleQuestionNumberPress}>
            <Text style={styles.questionNumber}>{currentQuestion}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestion === totalQuestions && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={currentQuestion === totalQuestions}
          >
            {questionOptions.length !== 6 && (
              <Text style={[styles.navButtonText]}>Next</Text>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={
                currentQuestion === totalQuestions
                  ? COLORS.textMuted
                  : COLORS.primary
              }
            />
          </TouchableOpacity>

          {/* Answer Options - Dynamic based on API */}
          {isMultipleChoice &&
            questionOptions.map((option: string) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  !selectedOption?.selectedOption &&
                    styles.optionButtonSelectedWrong,
                  selectedOption?.selectedOption === option &&
                    (selectedOption.selectedOption ===
                    selectedOption.correctAnswer
                      ? styles.optionButtonSelected
                      : styles.optionButtonSelectedWrong),
                  selectedOption?.correctAnswer === option &&
                    styles.optionButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    !selectedOption?.selectedOption &&
                      styles.optionButtonTextSelectedWrong,
                    selectedOption?.selectedOption === option &&
                      (selectedOption.selectedOption ===
                      selectedOption.correctAnswer
                        ? styles.optionButtonTextSelected
                        : styles.optionButtonTextSelectedWrong),
                    selectedOption?.correctAnswer === option &&
                      styles.optionButtonTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* Text Input for Non-Multiple Choice Questions */}
        {!isMultipleChoice && (
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLabel}>Javobingizni kiriting:</Text>
            <TextInput
              style={styles.textInput}
              value={textInputValue}
              readOnly
              placeholder="Matematik klaviaturadan foydalaning..."
              placeholderTextColor={COLORS.gray}
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
              showSoftInputOnFocus={false}
              caretHidden={false}
              editable={true}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.choiceButton]}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Video yuklanmagan",
              });
            }}
          >
            <Text style={styles.choiceButtonText}>Yechim</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Test Navigation Popover */}
      {showTestModal && (
        <View style={styles.popoverOverlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.popoverBackground}
            activeOpacity={1}
            onPress={() => setShowTestModal(false)}
          />

          <View style={styles.popoverContainer}>
            <View style={styles.popoverHeader}>
              <Text style={styles.popoverTitle}>Testni tanlang</Text>
            </View>

            <ScrollView
              style={styles.popoverContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 🔹 answerKeys ni subTestNo bo‘yicha guruhlab chiqamiz */}
              {Object.entries(
                testData.answerKeys?.reduce((acc: any, key: any) => {
                  const group = acc[key.subTestNo] || [];
                  group.push(key);
                  acc[key.subTestNo] = group;
                  return acc;
                }, {})
              ).map(([subTestNo, questions]: [any, any]) => (
                <View key={subTestNo}>
                  <Text style={styles.subTestTitle}>Test {subTestNo}</Text>

                  <View style={styles.testGrid}>
                    {questions.map((item: any) => {
                      const testNumber = item.questionNumber;
                      const isCorrect = answers.find(
                        (a) => a.questionId === testNumber
                      )?.isCorrect;
                      const isCurrent = testNumber === currentQuestion;

                      return (
                        <TouchableOpacity
                          key={testNumber}
                          style={[
                            styles.testGridItem,
                            isCorrect
                              ? styles.optionButtonSelected
                              : styles.optionButtonSelectedWrong,
                            isCurrent && styles.testGridItemCurrent,
                          ]}
                          onPress={() => handleTestSelect(testNumber)}
                        >
                          <Text
                            style={[
                              styles.testGridItemText,
                              (isCorrect || isCurrent) &&
                                styles.testGridItemTextActive,
                            ]}
                          >
                            {testNumber}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.popoverArrow} />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.base,
      minHeight: 60,
    },
    headerButton: {
      padding: SPACING.xs,
      minWidth: 40,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: "center",
      paddingHorizontal: SPACING.base,
    },
    headerTitle: {
      fontSize: FONT_SIZES.lg,
      fontWeight: "bold",
      color: COLORS.white,
    },
    headerSubtitle: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.white,
      opacity: 0.8,
    },
    pageIndicator: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
      minWidth: 50,
      alignItems: "center",
    },
    pageText: {
      fontSize: FONT_SIZES.sm,
      color: COLORS.white,
      fontWeight: "500",
    },
    pdfContainer: {
      flex: 1,
      backgroundColor: COLORS.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: COLORS.white,
    },
    loadingText: {
      marginTop: SPACING.base,
      fontSize: FONT_SIZES.base,
      color: COLORS.text,
    },
    pdf: {
      flex: 1,
      width: width,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: SPACING.xl,
    },
    errorTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: COLORS.text,
      marginTop: SPACING.base,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.base,
      borderRadius: BORDER_RADIUS.base,
      marginTop: SPACING.xl,
    },
    retryButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.white,
      fontWeight: "500",
    },
    quizControls: {
      position: "relative",
      backgroundColor: COLORS.white,
      paddingTop: SPACING.base,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: "#dededeff",
    },
    topControlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#f8f9fa",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      marginHorizontal: -SPACING.lg,
      marginTop: -SPACING.base,
      marginBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: "#dededeff",
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
    },
    navButtonDisabled: {
      opacity: 0.5,
    },
    navButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.primary,
    },
    navButtonTextDisabled: {
      color: COLORS.gray,
    },
    questionNumber: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: COLORS.text,
      marginHorizontal: SPACING.sm,
    },
    optionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.white,
      borderWidth: 2,
      borderColor: COLORS.gray,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: SPACING.xs,
    },
    optionButtonSelected: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
    },
    optionButtonSelectedWrong: {
      backgroundColor: COLORS.error,
      borderColor: COLORS.error,
    },
    optionButtonDisabled: {
      opacity: 0.6,
    },
    optionButtonText: {
      fontSize: FONT_SIZES.base,
      fontWeight: "bold",
      color: COLORS.text,
    },
    optionButtonTextSelected: {
      color: COLORS.white,
    },
    optionButtonTextSelectedWrong: {
      color: COLORS.white,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: SPACING.base,
    },
    actionButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    choiceButton: {
      backgroundColor: COLORS.white,
      borderWidth: 1,
      borderColor: COLORS.secondary,
    },
    choiceButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.text,
      fontWeight: "500",
    },
    confirmButton: {
      backgroundColor: COLORS.primary,
      flexDirection: "row",
      alignItems: "center",
    },
    confirmButtonDisabled: {
      backgroundColor: COLORS.gray,
      opacity: 0.6,
    },
    confirmButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.white,
      fontWeight: "500",
      marginRight: SPACING.xs,
    },
    confirmButtonTextDisabled: {
      color: "gray",
    },
    handIcon: {
      marginLeft: SPACING.xs,
    },
    finishButton: {
      backgroundColor: "#e74c3c",
      paddingVertical: SPACING.sm + 3,
      borderRadius: BORDER_RADIUS.sm,
      marginTop: SPACING.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    finishButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.white,
      fontWeight: "bold",
      marginRight: SPACING.xs,
    },
    finishIcon: {
      marginLeft: SPACING.xs,
    },
    // Popover styles
    popoverOverlay: {
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    popoverBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent",
    },
    popoverContainer: {
      position: "absolute",
      bottom: 180, // Above the quiz controls
      left: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: COLORS.white,
      borderRadius: BORDER_RADIUS.lg,
      maxHeight: 300,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    popoverHeader: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.textMuted,
      alignItems: "center",
    },
    popoverTitle: {
      fontSize: FONT_SIZES.base,
      fontWeight: "bold",
      color: COLORS.text,
    },
    popoverContent: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      maxHeight: 220,
    },
    popoverArrow: {
      position: "absolute",
      bottom: -8,
      left: "50%",
      marginLeft: -8,
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderTopWidth: 8,
      borderLeftColor: "transparent",
      borderRightColor: "transparent",
      borderTopColor: COLORS.white,
    },
    subTestTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    testGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    testGridItem: {
      width: 36,
      height: 36,
      borderRadius: 120,
      backgroundColor: "#f5f5f5fb",
      borderWidth: 1,
      borderColor: COLORS.secondary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    testGridItemAnswered: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    testGridItemCurrent: {
      backgroundColor: "#ffd700",
      borderColor: "#ffd700",
    },
    testGridItemText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "bold",
      color: COLORS.text,
    },
    testGridItemTextActive: {
      color: COLORS.white,
    },
    // Text Input styles
    textInputContainer: {
      marginBottom: SPACING.base,
    },
    textInputLabel: {
      fontSize: FONT_SIZES.base,
      fontWeight: "500",
      color: COLORS.text,
      marginBottom: SPACING.xs,
    },
    textInput: {
      borderWidth: 1,
      borderColor: COLORS.gray,
      borderRadius: BORDER_RADIUS.sm,
      padding: SPACING.sm,
      fontSize: FONT_SIZES.base,
      color: COLORS.text,
      backgroundColor: COLORS.white,
      minHeight: 80,
      textAlignVertical: "top",
    },
  });
