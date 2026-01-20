import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";

import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import {
  useCurrentUserId,
  useSubmitTestResults,
  useThemeTest,
} from "@/src/hooks/useQuiz";
import { AnswerKey, QuizAnswer, Theme } from "@/src/types";
import { CustomStyledCard } from "@/src/components/ui/cards/CustomStyledCard";
import { moderateScale } from "react-native-size-matters";
import { ScaledSheet } from "react-native-size-matters";

const { width } = Dimensions.get("window");

interface LocalQuizAnswer {
  questionId: number;
  selectedOption: string | null;
  subTestNo: number;
  isConfirmed: boolean;
}

// Memoized komponentlar
const HeaderTitle = React.memo(({ title }: { title: string }) => (
  <View style={headerTitleStyles.container}>
    <Text style={headerTitleStyles.title}>{title}</Text>
  </View>
));

const HeaderRight = React.memo(({ percent }: { percent: number }) => (
  <View style={headerRightStyles.container}>
    <Text style={headerRightStyles.text}>{percent}</Text>
  </View>
));

const LoadingState = React.memo(() => (
  <SafeAreaView style={loadingStyles.container}>
    <View style={loadingStyles.content}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={loadingStyles.text}>Test yuklanmoqda...</Text>
    </View>
  </SafeAreaView>
));

const ErrorState = React.memo(({ onRetry }: { onRetry: () => void }) => (
  <SafeAreaView style={errorStyles.container}>
    <View style={errorStyles.content}>
      <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
      <Text style={errorStyles.title}>Test ma'lumotlari yuklanmadi</Text>
      <TouchableOpacity style={errorStyles.button} onPress={onRetry}>
        <Text style={errorStyles.buttonText}>Orqaga qaytish</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
));

const PdfViewer = React.memo(
  ({ testId, authToken }: { testId: number; authToken: string | null }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme.theme), [theme.theme]);

    const handleLoadComplete = useCallback((numberOfPages: number) => {
      console.log("PDF loaded with", numberOfPages, "pages");
    }, []);

    const handleError = useCallback((error: any) => {
      Alert.alert(
        "Xatolik",
        "PDF faylni ochishda xatolik yuz berdi. Fayl mavjudligini tekshiring.",
        [{ text: "OK" }]
      );
      console.error("PDF Error:", error);
    }, []);

    if (!authToken) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={COLORS.gray} />
          <Text style={styles.errorTitle}>Autentifikatsiya xatosi</Text>
        </View>
      );
    }

    return (
      <Pdf
        source={{
          uri: `${Constants.expoConfig?.extra?.API_URL}/api/theme-test/${testId}/pdf`,
          headers: { Authorization: `Bearer ${authToken}` },
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
        enableDoubleTapZoom
        minScale={1}
        maxScale={5}
        renderActivityIndicator={() => (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      />
    );
  }
);

const OptionButton = React.memo(
  ({
    option,
    isSelected,
    onSelect,
    disabled = false,
    styles,
  }: {
    option: string;
    isSelected: string | null | undefined;
    disabled: boolean;
    onSelect: (selectedOption: any) => void;
    styles: any;
  }) => (
    <TouchableOpacity
      activeOpacity={1}
      style={[
        styles.optionButton,
        isSelected === option && styles.optionButtonSelected,
      ]}
      onPress={() => onSelect(option)}
      disabled={disabled}
    >
      <Text
        style={[
          styles.optionButtonText,
          isSelected === option && styles.optionButtonTextSelected,
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  )
);

const TestGridItem = React.memo(
  ({
    item,
    answers,
    handleConfirm,
    isFinishing,
    styles,
  }: {
    item: AnswerKey;
    answers: LocalQuizAnswer[];
    isFinishing: boolean;
    handleConfirm: (
      selectedOption: any,
      currentQuestion: any,
      currentSubTestNo: any
    ) => void;
    styles: any;
  }) => {
    const questionOptions = useMemo(
      () => (item?.options ? JSON.parse(item.options) : []),
      [item]
    );
    const currentAnswer = answers.find(
      (a) => a.questionId === item.dbQuestionNumber
    );
    return (
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <Text style={[styles.testGridItemText]}>{item.questionNumber}</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 4,
          }}
        >
          {questionOptions.map((option: string) => (
            <OptionButton
              key={option}
              option={option}
              disabled={isFinishing}
              isSelected={currentAnswer?.selectedOption}
              onSelect={(selected) =>
                handleConfirm(selected, item.dbQuestionNumber, item.subTestNo)
              }
              styles={styles}
            />
          ))}
        </View>
      </View>
    );
  }
);

export default function QuizScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { testId, mavzu, percent } = route.params;
  const numericTestId = Number(testId);

  // API hooks
  const {
    data: testData,
    isLoading: testLoading,
    error: testError,
  } = useThemeTest(numericTestId);

  const submitResults = useSubmitTestResults();
  const currentUserId = useCurrentUserId();

  // State management
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LocalQuizAnswer[]>([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showTestIndex, setShowTestIndex] = useState(1);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isFinishing, _setIsFinishing] = useState(false);

  // Memoized values
  const totalQuestions = useMemo(
    () => testData?.questionCount || 0,
    [testData]
  );
  const groupedSubTest = useMemo(() => {
    if (!testData) return [];
    const groups: { [key: number]: AnswerKey[] } = {};

    // Guruhlash: subTestNo bo‘yicha
    testData.answerKeys.forEach((item) => {
      if (!groups[item.subTestNo]) {
        groups[item.subTestNo] = [];
      }
      groups[item.subTestNo].push(item);
    });

    // Har bir guruhdan faqat birinchi elementni olish
    const result = Object.values(groups).map(
      (group) => (group as AnswerKey[])[0].subTestNo
    );

    return result;
  }, [testData]);
  // Auth token loading
  useEffect(() => {
    const loadAuthToken = async () => {
      try {
        const sessionData = await SecureStore.getItemAsync("session");
        if (sessionData) {
          const { token } = JSON.parse(sessionData);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error loading auth token:", error);
      }
    };

    loadAuthToken();
  }, []);

  // Load saved answer when question changes
  // useEffect(() => {
  //   const savedAnswer = answers.find((a) => a.questionId === currentQuestion);
  //   if (savedAnswer) {
  //     setSelectedOption(savedAnswer.selectedOption);
  //     setTextInputValue(
  //       isMultipleChoice ? "" : savedAnswer.selectedOption || ""
  //     );
  //   } else {
  //     setSelectedOption(null);
  //     setTextInputValue("");
  //   }
  // }, [currentQuestion, answers, isMultipleChoice]);

  // Event handlers
  const handleGoBack = useCallback(() => {
    Alert.alert(
      "Testni tark etish",
      "Haqiqatan ham testni tark etmoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { text: "Chiqish", onPress: () => navigation.goBack() },
      ]
    );
  }, []);

  // const handleOptionSelect = useCallback(
  //   (option: string) => {
  //     setSelectedOption(option);
  //     setTextInputValue("");
  //     if (currentAnswer?.isConfirmed) {
  //       handleEditAnswer();
  //     }
  //   },
  //   [currentAnswer]
  // );

  const handleConfirm = useCallback(
    (selectedOption: any, currentQuestion: any, currentSubTestNo: any) => {
      if (!selectedOption) return;

      const newAnswer: LocalQuizAnswer = {
        questionId: currentQuestion,
        selectedOption: selectedOption,
        subTestNo: currentSubTestNo ?? 1,
        isConfirmed: true,
      };

      setAnswers((prev) => {
        const filtered = prev.filter((a) => a.questionId !== currentQuestion);
        return [...filtered, newAnswer];
      });
    },
    [selectedOption, totalQuestions]
  );

  // const handleEditAnswer = useCallback(() => {
  //   setAnswers((prev) => prev.filter((a) => a.questionId !== currentQuestion));
  // }, [currentQuestion]);

  // const handleNext = useCallback(() => {
  //   setShowTestModal(false);
  //   setCurrentQuestion((prev) => prev + 1);
  // }, [currentQuestion, totalQuestions]);

  // const handlePrevious = useCallback(() => {
  //   if (currentQuestion > 1) {
  //     setShowTestModal(false);
  //     setCurrentQuestion((prev) => prev - 1);
  //   }
  // }, [currentQuestion]);

  const handleFinishTest = useCallback(async () => {
    if (!currentUserId || !testId) {
      Alert.alert("Xatolik", "Foydalanuvchi ma'lumotlari topilmadi");
      return;
    }

    const answeredQuestions = answers.filter((a) => a.isConfirmed).length;
    const unansweredCount = totalQuestions - answeredQuestions;

    Alert.alert(
      "Testni yakunlash",
      `Siz ${totalQuestions} ta savoldan ${answeredQuestions} tasiga javob berdingiz.${
        unansweredCount > 0
          ? `\n${unansweredCount} ta savol javobsiz qoldi.`
          : ""
      }\n\nTestni yakunlamoqchimisiz?`,
      [
        { text: "Bekor qilish", style: "cancel" },
        {
          text: "Ha, yakunlash",
          style: "destructive",
          onPress: async () => {
            try {
              const submissionAnswers: QuizAnswer[] = answers
                .filter((a) => a.isConfirmed)
                .map((answer) => ({
                  questionNumber: answer.questionId,
                  subTestNo: answer.subTestNo,
                  partIndex:
                    testData?.answerKeys?.find(
                      (ak) => ak.dbQuestionNumber === answer.questionId
                    )?.partIndex || 0,
                  answer: answer.selectedOption || "",
                }));
              await submitResults.mutateAsync({
                testId: numericTestId,
                userId: currentUserId,
                answers: submissionAnswers,
              });
              navigation.navigate("QuizResults", {
                testId: numericTestId,
                userId: currentUserId,
                themeId: testData?.themeId,
                mavzu: mavzu || "1-mavzu",
              });
              // navigation.navigate({
              //   pathname: "/lesson/lessondetail/quiz/result",
              //   params: {
              //     testId: numericTestId,
              //     userId: currentUserId,
              //     themeId: testData?.themeId,
              //     mavzu: mavzu || "1-mavzu",
              //   },
              // });
            } catch (error) {
              console.error("Error submitting quiz:", error);
              Alert.alert(
                "Xatolik",
                "Test natijalarini yuborishda xatolik yuz berdi. Qaytadan urinib ko'ring.",
                [
                  { text: "Bekor qilish", style: "cancel" },
                  { text: "Qayta urinish", onPress: () => handleFinishTest() },
                ]
              );
            }
          },
        },
      ]
    );
  }, [
    currentUserId,
    testId,
    answers,
    totalQuestions,
    testData,
    numericTestId,
    mavzu,
    submitResults,
  ]);
  // useEffect(() => {
  //   if (currentQuestion === totalQuestions && currentAnswer?.isConfirmed) {
  //     setIsFinishing(true);
  //     const timer = setTimeout(() => {
  //       handleFinishTest();
  //       setIsFinishing(false);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [answers, currentQuestion, handleNext]);

  const handleShowTestModal = useCallback(() => {
    setShowTestModal(true);
  }, []);

  // const handleTestSelect = useCallback((testNumber: number) => {
  //   // setCurrentQuestion(testNumber);
  //   setShowTestModal(false);
  // }, []);

  // Grouped test data for modal
  // const groupedTestData = useMemo(() => {
  //   if (!testData?.answerKeys) return [];

  //   return Object.entries(
  //     testData.answerKeys.reduce((acc: any, key: any) => {
  //       const group = acc[key.subTestNo] || [];
  //       group.push(key);
  //       acc[key.subTestNo] = group;
  //       return acc;
  //     }, {})
  //   );
  // }, [testData]);
  const groupedTestData = useMemo(() => {
    if (!testData?.answerKeys) return [];

    return testData.answerKeys.filter(
      (item) => item.subTestNo === showTestIndex
    );
  }, [testData, showTestIndex]);

  useEffect(() => {
    navigation.setOptions({
      title: "IDS mavzulashtirilgan \n testlar  to'plami",
      headerTitle: ({ children }: { children: any }) => (
        <HeaderTitle
          title={children}
        />
      ),
      freezeOnBlur: true,
      headerRight: () => <HeaderRight percent={percent} />,
    });
  }, [navigation]);
  // Loading and error states
  if (testLoading) {
    return <LoadingState />;
  }

  if (testError || !testData) {
    return <ErrorState onRetry={handleGoBack} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* PDF Content */}
      <View style={styles.pdfContainer}>
        {/* {pdfBlob && authToken ? ( */}
        <PdfViewer testId={numericTestId} authToken={authToken} />
        {/* ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.gray} />
            <Text style={styles.errorTitle}>Test topilmadi</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
              <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
            </TouchableOpacity>
          </View>
        )} */}
      </View>
      <View style={styles.quizControls}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.choiceButton]}
            onPress={() => {
              setSelectedOption(null);
            }}
            activeOpacity={1}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(20)}
              style={{
                flexGrow: 1,
              }}
              onPress={() => {
                setShowTestIndex((prev) => prev - 1);
              }}
              disabled={showTestIndex === 1}
              color={showTestIndex === 1 ? COLORS.textMuted : COLORS.primary}
            />
            <Text style={styles.choiceButtonText}>{showTestIndex}-test</Text>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(20)}
              color={
                showTestIndex === groupedSubTest.length
                  ? COLORS.textMuted
                  : COLORS.primary
              }
              onPress={() => {
                setShowTestIndex((prev) => prev + 1);
              }}
              disabled={showTestIndex === groupedSubTest.length}
              style={{
                flexGrow: 1,
                textAlign: "right",
              }}
            />
          </TouchableOpacity>

          <CustomStyledCard
            style={{
              flexGrow: 1,
              flexShrink: 0,
              borderRadius: moderateScale(BORDER_RADIUS.sm),
            }}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.confirmButton,
                // !isAnswerSelected && styles.confirmButtonDisabled,
              ]}
              onPress={handleShowTestModal}
              disabled={isFinishing}
            >
              {isFinishing ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.confirmButtonText,
                      // !isAnswerSelected && styles.confirmButtonTextDisabled,
                    ]}
                  >
                    Belgilash
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </CustomStyledCard>
        </View>
        <CustomStyledCard
          style={{
            marginTop: moderateScale(SPACING.sm),
            borderRadius: moderateScale(BORDER_RADIUS.sm),
          }}
        >
          <TouchableOpacity
            onPress={handleFinishTest}
            activeOpacity={1}
            style={styles.finishButton}
            disabled={submitResults.isPending}
          >
            {submitResults.isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.finishButtonText}>Testni yakunlash</Text>
            )}
          </TouchableOpacity>
        </CustomStyledCard>
      </View>

      {/* Test Navigation Popover */}
      {showTestModal && (
        <TestModal
          groupedTestData={groupedTestData}
          handleConfirm={handleConfirm}
          answers={answers}
          isFinishing={isFinishing}
          onClose={() => setShowTestModal(false)}
          styles={styles}
        />
      )}
    </SafeAreaView>
  );
}

const TestModal = React.memo(
  ({
    groupedTestData,
    handleConfirm,
    answers,
    isFinishing,
    onClose,
    styles,
  }: {
    groupedTestData: AnswerKey[];
    answers: LocalQuizAnswer[];
    isFinishing: boolean;
    handleConfirm: (
      selectedOption: any,
      currentQuestion: any,
      currentSubTestNo: any
    ) => void;
    onClose: () => void;
    styles: any;
  }) => {
    const leftColumn = groupedTestData.slice(0, 10);
    const rightColumn = groupedTestData.slice(10, 20);
    return (
      <View style={styles.popoverOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.popoverBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.popoverContainer}>
          <View style={styles.popoverHeader}>
            <Text style={styles.popoverTitle}>
              {groupedTestData[0].subTestNo}-test
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 0,
            }}
          >
            {/* LEFT COLUMN: 1–10 */}
            <View>
              <FlatList
                data={leftColumn}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TestGridItem
                    item={item}
                    isFinishing={isFinishing}
                    handleConfirm={handleConfirm}
                    answers={answers}
                    styles={styles}
                  />
                )}
              />
            </View>

            {/* RIGHT COLUMN: 11–20 */}
            <View>
              <FlatList
                data={rightColumn}
                scrollEnabled={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TestGridItem
                    item={item}
                    isFinishing={isFinishing}
                    handleConfirm={handleConfirm}
                    answers={answers}
                    styles={styles}
                  />
                )}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }
);

// Alohida style sheet'lar
const headerTitleStyles = ScaledSheet.create({
  container: {
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.lg),
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    lineHeight: moderateScale(20),
    color: COLORS.white,
  },
});

const headerRightStyles = ScaledSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 50,
    alignItems: "center",
  },
  text: {
    fontSize: moderateScale(FONT_SIZES.sm),
    color: COLORS.white,
    fontWeight: "500",
  },
});

const loadingStyles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  text: {
    marginTop: SPACING.base,
    fontSize: moderateScale(FONT_SIZES.base),
    color: COLORS.text,
  },
});

const errorStyles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(SPACING.xl),
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.xl),
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: SPACING.base,
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
    marginTop: SPACING.xl,
  },
  buttonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: "500",
  },
});

const createStyles = (theme: Theme) =>
  ScaledSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    pdfContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      backgroundColor: theme.colors.card,
      paddingTop: SPACING.base,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
    },
    topControlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      marginHorizontal: -SPACING.lg,
      marginTop: -SPACING.base,
      marginBottom: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
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
    dbQuestionNumber: {
      fontSize: FONT_SIZES.base,
      fontWeight: "bold",
      color: theme.colors.text,
      marginHorizontal: SPACING.sm,
    },
    optionButton: {
      width: (25 / 385) * width,
      aspectRatio: 1 / 1,
      borderRadius: (8 / 375) * width,
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.textMuted,
      justifyContent: "center",
      alignItems: "center",
    },
    optionButtonSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    optionButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "500",
      color: theme.colors.text,
    },
    optionButtonTextSelected: {
      color: COLORS.white,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: SPACING.base,
    },
    actionButton: {
      flex: 1,
      paddingVertical: moderateScale(SPACING.sm),

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    choiceButton: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    choiceButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: theme.colors.text,
      fontWeight: "500",
    },
    confirmButton: {
      flexDirection: "row",
      alignItems: "center",
    },
    confirmButtonDisabled: {
      backgroundColor: COLORS.white,
      opacity: 0.6,
    },
    confirmButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
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
      paddingVertical: moderateScale(SPACING.sm),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    finishButtonText: {
      fontSize: moderateScale(FONT_SIZES.base),
      color: COLORS.white,
      fontWeight: "bold",
      marginRight: moderateScale(SPACING.xs),
    },
    finishIcon: {
      marginLeft: moderateScale(SPACING.xs),
    },
    popoverOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
    },
    popoverBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "transparent",
    },
    popoverContainer: {
      position: "absolute",
      bottom: moderateScale(155),
      left: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: theme.colors.card,
      paddingHorizontal: moderateScale(10),
      paddingBottom: moderateScale(6),
      borderColor: theme.colors.inputBorder,
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.lg,
    },
    popoverHeader: {
      paddingVertical: SPACING.xs,
      alignItems: "flex-start",
    },
    popoverTitle: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: theme.colors.text,
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
      backgroundColor: theme.colors.border,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      fontSize: (FONT_SIZES.lg / width) * width,
      fontWeight: "500",
      width: 22,
      textAlign: "right",
      color: theme.colors.text,
    },
    testGridItemTextActive: {
      color: COLORS.white,
    },
    textInputContainer: {
      marginBottom: SPACING.base,
    },
    textInputLabel: {
      fontSize: moderateScale(FONT_SIZES.base),
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
