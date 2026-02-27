import { Ionicons } from "@expo/vector-icons";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { SafeAreaView } from "react-native-safe-area-context";
import MathView from "react-native-math-view";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import {
  useCurrentUserId,
  useSubmitTestResults,
  useThemeTest,
} from "@/src/hooks/useQuiz";
import { QuizAnswer, Theme, ThemeTest } from "@/src/types";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { GestureViewer } from "react-native-gesture-image-viewer";
import { moderateScale } from "react-native-size-matters";
import MathLiveModalKeyboard, {
  MathLiveModalRef,
} from "@/src/components/MathKeyboard";
import {
  useFocusEffect,
  useIsFocused,
  usePreventRemove,
} from "@react-navigation/native";

const { width } = Dimensions.get("window");

interface LocalQuizAnswer {
  questionId: number;
  selectedOption: string | null;
  subTestNo: number;
  isConfirmed: boolean;
}

// Memoized komponentlar
const HeaderTitle = React.memo(
  ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View style={headerTitleStyles.container}>
      <Text style={headerTitleStyles.title}>{title}</Text>
      <Text style={headerTitleStyles.subtitle}>{subtitle}</Text>
    </View>
  ),
);

const HeaderRight = React.memo(
  ({
    currentQuestion,
    totalQuestions,
  }: {
    currentQuestion: number;
    totalQuestions: number;
  }) => (
    <View style={headerRightStyles.container}>
      <Text style={headerRightStyles.text}>
        {currentQuestion}/{totalQuestions}
      </Text>
    </View>
  ),
);

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

const OptionButton = React.memo(
  ({
    option,
    isSelected,
    onSelect,
    disabled = false,
    styles,
  }: {
    option: string;
    isSelected: boolean;
    disabled: boolean;
    onSelect: (option: string) => void;
    styles: any;
  }) => (
    <TouchableOpacity
      style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
      onPress={() => onSelect(option)}
      disabled={disabled}
    >
      <Text
        style={[
          styles.optionButtonText,
          isSelected && styles.optionButtonTextSelected,
        ]}
      >
        {option}
      </Text>
    </TouchableOpacity>
  ),
);

const TestGridItem = React.memo(
  ({
    testNumber,
    orderNumber,
    isAnswered,
    isCurrent,
    onSelect,
    styles,
  }: {
    testNumber: number;
    orderNumber: number;
    isAnswered: any;
    isCurrent: boolean;
    onSelect: (testNumber: number) => void;
    styles: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.testGridItem,
        isAnswered && styles.testGridItemAnswered,
        isCurrent && styles.testGridItemCurrent,
      ]}
      onPress={() => onSelect(testNumber)}
    >
      <Text
        style={[
          styles.testGridItemText,
          (isAnswered || isCurrent) && styles.testGridItemTextActive,
        ]}
      >
        {orderNumber}
      </Text>
    </TouchableOpacity>
  ),
);
const ImageViewer = React.memo(
  ({
    images,
    theme,
  }: {
    images: ThemeTest["answerKeys"][0]["testPhotos"];
    theme: Theme;
  }) => {
    const [visible, setVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<Animated.ScrollView>(null);
    const renderImage = useCallback((imageUrl: string) => {
      return (
        <Image
          source={{ uri: Constants.expoConfig?.extra?.API_URL + imageUrl }}
          style={{ flex: 1, width: "95%" }}
          resizeMode="contain"
        />
      );
    }, []);
    const openModal = () => setVisible(true);
    const onClose = () => setVisible(false);
    const onScroll = useAnimatedScrollHandler({
      onScroll: (event) => {
        const x = event.contentOffset.x;
        const index = Math.round(x / width);
        runOnJS(setSelectedIndex)(index); // 🔥 Har bir slaydda index yangilanadi
      },
    });
    useEffect(() => {
      setSelectedIndex(0);
      scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
    }, [images]);

    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            alignItems: "flex-end",
            paddingHorizontal: SPACING.lg,
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
            }}
          >
            {selectedIndex + 1}/{images.length}
          </Text>
        </View>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {images.map((img) => (
            <Pressable
              key={img.fileId}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                width: width - 4,
              }}
              onPress={openModal}
            >
              <Image
                source={{
                  uri: Constants.expoConfig?.extra?.API_URL + img.relativePath,
                }}
                style={{ width: "95%", height: 300 }}
                resizeMode="contain"
              />
            </Pressable>
          ))}
        </Animated.ScrollView>
        <Modal
          transparent
          onRequestClose={onClose}
          visible={visible}
          backdropColor={"green"}
        >
          <BlurView
            intensity={10} // 0 dan 100 gacha, qanchalik blur bo‘lishini belgilaydi
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={{ ...StyleSheet.absoluteFillObject }}
          />
          <GestureViewer
            data={images.map((item) => item.relativePath)}
            initialIndex={selectedIndex}
            backdropStyle={{
              backgroundColor: "transparent",
            }}
            renderItem={renderImage}
            ListComponent={ScrollView}
            maxZoomScale={3}
            onDismiss={() => setVisible(false)}
          />
        </Modal>
      </View>
    );
  },
);
export default function QuizScreenSertificate({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isFocused = useIsFocused();
  const { testId, mavzu } = route.params;
  const numericTestId = Number(testId);
  const mathKeyboardRef = useRef<MathLiveModalRef>(null);
  // API hooks
  const {
    data: testData,
    isLoading: testLoading,
    error: testError,
  } = useThemeTest(numericTestId);

  const submitResults = useSubmitTestResults();
  const currentUserId = useCurrentUserId();

  // State management
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<LocalQuizAnswer[]>([]);
  const [showTestModal, setShowTestModal] = useState(false);
  const [textInputValue, setTextInputValue] = useState({
    textInput1: "",
    textInput2: "",
    activeInput: "textInput1",
  });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  // Memoized values
  const totalQuestions = useMemo(
    () => testData?.questionCount || 0,
    [testData],
  );

  const currentAnswerKey = useMemo(
    () =>
      testData?.answerKeys?.find(
        (ak) => ak.dbQuestionNumber === currentQuestion,
      ),
    [testData, currentQuestion],
  );
  const currentQuestionPhotos = useMemo(
    () =>
      testData?.answerKeys?.find(
        (ak) => ak.dbQuestionNumber === currentQuestion,
      )?.testPhotos,
    [testData, currentQuestion],
  );
  const isMultipleChoice = useMemo(
    () => currentAnswerKey?.answerType === 1,
    [currentAnswerKey],
  );
  const isDualText = useMemo(
    () => currentAnswerKey?.partIndex === 1,
    [currentAnswerKey],
  );
  const questionOptions = useMemo(
    () =>
      currentAnswerKey?.options ? JSON.parse(currentAnswerKey.options) : [],
    [currentAnswerKey],
  );

  const currentAnswer = useMemo(
    () => answers.find((a) => a.questionId === currentQuestion),
    [answers, currentQuestion],
  );

  const isAnswerSelected = useMemo(
    () =>
      isMultipleChoice
        ? selectedOption !== null
        : isDualText
          ? textInputValue.textInput1.trim() !== "" &&
            textInputValue.textInput2.trim() !== ""
          : textInputValue.textInput1.trim() !== "",
    [isMultipleChoice, selectedOption, textInputValue],
  );

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
  useEffect(() => {
    const savedAnswer = answers.filter((a) => a.questionId === currentQuestion);
    if (savedAnswer.length > 0) {
      setSelectedOption(savedAnswer[0].selectedOption);

      setTextInputValue(
        isMultipleChoice
          ? { textInput1: "", textInput2: "", activeInput: "textInput1" }
          : {
              textInput1: savedAnswer[0].selectedOption || "",
              textInput2: savedAnswer[1]?.selectedOption || "",
              activeInput: "textInput1",
            },
      );
    } else {
      setSelectedOption(null);
      setTextInputValue({
        textInput1: "",
        textInput2: "",
        activeInput: "textInput1",
      });
    }
  }, [currentQuestion, answers, isMultipleChoice]);

  // Event handlers
  const handleGoBack = useCallback(() => {
    Alert.alert(
      "Testni tark etish",
      "Haqiqatan ham testni tark etmoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        { text: "Chiqish", onPress: () => navigation.goBack() },
      ],
    );
    return true;
  }, []);

  const handleOptionSelect = useCallback(
    (option: string) => {
      setSelectedOption(option);
      setTextInputValue({
        textInput1: "",
        textInput2: "",
        activeInput: "textInput1",
      });
      if (currentAnswer?.isConfirmed) {
        handleEditAnswer();
      }
    },
    [currentAnswer],
  );
  const handleConfirm = useCallback(() => {
    const answerValue = isMultipleChoice
      ? selectedOption
      : textInputValue.textInput1.trim();
    if (!answerValue) return;

    const newAnswer: LocalQuizAnswer = {
      questionId: currentQuestion,
      selectedOption: answerValue,
      subTestNo: currentAnswerKey?.subTestNo ?? 1,
      isConfirmed: true,
    };
    const secondPartAnswer: LocalQuizAnswer = {
      questionId: currentQuestion,
      selectedOption: textInputValue.textInput2.trim(),
      subTestNo: currentAnswerKey?.subTestNo ?? 1,
      isConfirmed: true,
    };

    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== currentQuestion);
      return [
        ...filtered,
        newAnswer,
        isDualText ? secondPartAnswer : null,
      ].filter(Boolean) as LocalQuizAnswer[];
    });

    if (currentQuestion < totalQuestions) {
      handleNext();
    }
  }, [
    isMultipleChoice,
    selectedOption,
    textInputValue,
    currentQuestion,
    currentAnswerKey,
    totalQuestions,
  ]);

  const handleEditAnswer = useCallback(() => {
    setAnswers((prev) => prev.filter((a) => a.questionId !== currentQuestion));
  }, [currentQuestion]);

  const handleNext = useCallback(() => {
    setShowTestModal(false);
    setCurrentQuestion((prev) => prev + 1);
  }, [currentQuestion, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 1) {
      setShowTestModal(false);
      setCurrentQuestion((prev) => prev - 1);
    }
  }, [currentQuestion]);

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
              const confirmedAnswers = answers.filter((a) => a.isConfirmed);

              // 1️⃣ answerKeys ni questionNumber bo‘yicha guruhlaymiz
              const groupedAnswerKeys =
                testData?.answerKeys?.reduce(
                  (acc, key) => {
                    if (!acc[key.dbQuestionNumber]) {
                      acc[key.dbQuestionNumber] = [];
                    }
                    acc[key.dbQuestionNumber].push(key);
                    return acc;
                  },
                  {} as Record<number, typeof testData.answerKeys>,
                ) || {};

              // 2️⃣ Har bir question uchun counter
              const questionCounter: Record<number, number> = {};

              const submissionAnswers: QuizAnswer[] = confirmedAnswers.map(
                (answer) => {
                  const questionId = answer.questionId;
                  const relatedKeys = groupedAnswerKeys[questionId] || [];

                  // Agar faqat 1 ta bo‘lsa → partIndex = 0
                  if (relatedKeys.length <= 1) {
                    return {
                      questionNumber: questionId,
                      subTestNo: answer.subTestNo,
                      partIndex: 0,
                      answer: answer.selectedOption || "",
                    };
                  }

                  // Agar bir nechta bo‘lsa → 1,2,3...
                  if (!questionCounter[questionId]) {
                    questionCounter[questionId] = 0;
                  }

                  questionCounter[questionId] += 1;

                  return {
                    questionNumber: questionId,
                    subTestNo: answer.subTestNo,
                    partIndex: questionCounter[questionId],
                    answer: answer.selectedOption || "",
                  };
                },
              );

              await submitResults.mutateAsync({
                testId: numericTestId,
                userId: currentUserId,
                answers: submissionAnswers,
              });
              navigation.navigate("QuizResultsSertificate", {
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
                ],
              );
            }
          },
        },
      ],
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
  useEffect(() => {
    if (currentQuestion === totalQuestions && currentAnswer?.isConfirmed) {
      setIsFinishing(true);
      const timer = setTimeout(() => {
        handleFinishTest();
        setIsFinishing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [answers, currentQuestion, handleNext]);

  const handleQuestionNumberPress = useCallback(() => {
    setShowTestModal(true);
  }, []);

  const handleTestSelect = useCallback((testNumber: number) => {
    setCurrentQuestion(testNumber);
    setShowTestModal(false);
  }, []);

  // Grouped test data for modal
  const groupedTestData = useMemo(() => {
    if (!testData?.answerKeys) return [];

    return Object.entries(
      testData.answerKeys
        .filter(
          (item: any, index: any, self: any) =>
            index ===
            self.findIndex(
              (q: any) => q.questionNumber === item.questionNumber,
            ),
        )
        .reduce((acc: any, key: any) => {
          const group = acc[key.subTestNo] || [];
          group.push(key);
          acc[key.subTestNo] = group;
          return acc;
        }, {}),
    );
  }, [testData]);
  usePreventRemove(isFocused, ({ data }) => {
    Alert.alert(
      "Testni tark etish",
      "Haqiqatan ham testni tark etmoqchimisiz?",
      [
        { text: "Bekor qilish", style: "cancel" },
        {
          text: "Chiqish",
          onPress: () => navigation.dispatch(data.action),
        },
      ],
    );
  });
  useFocusEffect(() => {
    navigation.setOptions({
      title: mavzu.toString(),
      headerTitle: ({ children }: { children: any }) => (
        <HeaderTitle title={children || "1-mavzu"} subtitle="Mashqlar" />
      ),
      headerBackTitle: "Orqaga",
      freezeOnBlur: true,
      // headerRight: () => (
      //   <HeaderRight
      //     currentQuestion={currentQuestion}
      //     totalQuestions={totalQuestions}
      //   />
      // ),
    });
  });
  // Loading and error states
  if (testLoading) {
    return <LoadingState />;
  }

  if (testError || !testData) {
    return <ErrorState onRetry={handleGoBack} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.solutionViewImageContainer}>
        {(currentQuestionPhotos?.length ?? 0 > 0) ? (
          <ImageViewer images={currentQuestionPhotos ?? []} theme={theme} />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.text,
              }}
            >
              Rasm yuklanmagan
            </Text>
          </View>
        )}
      </View>

      {/* Quiz Controls */}
      <View style={styles.quizControls}>
        {/* Navigation and Answer Options Row */}
        <View style={styles.topControlsRow}>
          <View
            style={{
              flexDirection: "row",
              position: "relative",
              alignItems: "center",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -12,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                {currentAnswerKey?.subTestNo}-test
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentQuestion === 1 && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={currentQuestion === 1 || isFinishing}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={
                  currentQuestion === 1 ? COLORS.textMuted : COLORS.primary
                }
              />
              {questionOptions.length !== 6 && (
                <Text style={styles.navButtonText}>Back</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ position: "relative" }}
              onPress={handleQuestionNumberPress}
            >
              <Text style={styles.dbQuestionNumber}>
                {currentAnswerKey?.questionNumber}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentQuestion === totalQuestions && styles.navButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={currentQuestion === totalQuestions || isFinishing}
            >
              {questionOptions.length !== 6 && (
                <Text style={styles.navButtonText}>Next</Text>
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
          </View>
          {/* Answer Options */}
          {isMultipleChoice &&
            questionOptions.map((option: string) => (
              <OptionButton
                key={option}
                option={option}
                disabled={isFinishing}
                isSelected={selectedOption === option}
                onSelect={handleOptionSelect}
                styles={styles}
              />
            ))}
        </View>

        {/* Text Input for Non-Multiple Choice Questions */}
        {!isMultipleChoice && (
          <View style={styles.textInputContainer}>
            <Text style={styles.textInputLabel}>Javobingizni kiriting:</Text>
            {/* Custom Input Field */}
            <TouchableOpacity
              style={styles.customInput}
              onPress={() => {
                mathKeyboardRef.current?.show();
                setTextInputValue((prev) => ({
                  ...prev,
                  activeInput: "textInput1",
                }));
              }}
            >
              {textInputValue.textInput1 ? (
                <Text style={styles.customInputText}>
                  <MathView
                    math={textInputValue.textInput1}
                    style={{
                      fontSize: moderateScale(14),
                      width: "100%",
                      color: theme.colors.text,
                      justifyContent: "start",
                      alignItems: "start",
                      height: moderateScale(20),
                    }}
                  />
                </Text>
              ) : (
                <Text style={styles.customInputPlaceholder}>
                  {isDualText ? "Savol 1 matematik" : "Matematik "} ifodani
                  kiriting...
                </Text>
              )}
            </TouchableOpacity>
            {isDualText && (
              <TouchableOpacity
                style={[styles.customInput, { marginTop: 5 }]}
                onPress={() => {
                  mathKeyboardRef.current?.show();
                  setTextInputValue((prev) => ({
                    ...prev,
                    activeInput: "textInput2",
                  }));
                }}
              >
                {textInputValue.textInput2 ? (
                  <Text style={styles.customInputText}>
                    <MathView
                      math={textInputValue.textInput2}
                      style={{
                        fontSize: moderateScale(14),
                        width: "100%",
                        color: theme.colors.text,
                        justifyContent: "start",
                        alignItems: "start",
                        height: moderateScale(20),
                      }}
                    />
                  </Text>
                ) : (
                  <Text style={styles.customInputPlaceholder}>
                    {isDualText && "Savol 2 "} matematik ifodani kiriting...
                  </Text>
                )}
              </TouchableOpacity>
            )}
            {/* MathLive Modal Keyboard */}
            <MathLiveModalKeyboard
              ref={mathKeyboardRef}
              value={
                textInputValue[
                  textInputValue.activeInput as keyof typeof textInputValue
                ]
              }
              onChange={(newValue) => {
                setTextInputValue((prev) => ({
                  ...prev,
                  [textInputValue.activeInput]: newValue,
                }));
                setSelectedOption(null);
              }}
              onClose={() => {}}
            />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.choiceButton]}
            onPress={() => {
              setSelectedOption(null);
              setTextInputValue({
                textInput1: "",
                textInput2: "",
                activeInput: "textInput1",
              });
            }}
          >
            <Text style={styles.choiceButtonText}>Yechim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.confirmButton,
              !isAnswerSelected && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!isAnswerSelected || isFinishing}
          >
            {isFinishing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text
                  style={[
                    styles.confirmButtonText,
                    !isAnswerSelected && styles.confirmButtonTextDisabled,
                  ]}
                >
                  Tasdiqlash
                </Text>
                <Ionicons
                  name="hand-right"
                  size={20}
                  color={!isAnswerSelected ? COLORS.gray : "white"}
                  style={styles.handIcon}
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Finish Test Button */}
        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinishTest}
          disabled={submitResults.isPending}
        >
          {submitResults.isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Text style={styles.finishButtonText}>Testni yakunlash</Text>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="white"
                style={styles.finishIcon}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
      {/* Test Navigation Popover */}
      {showTestModal && (
        <TestModal
          groupedTestData={groupedTestData}
          answers={answers}
          currentQuestion={currentQuestion}
          onTestSelect={handleTestSelect}
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
    answers,
    currentQuestion,
    onTestSelect,
    onClose,
    styles,
  }: {
    groupedTestData: [string, any][];
    answers: LocalQuizAnswer[];
    currentQuestion: number;
    onTestSelect: (testNumber: number) => void;
    onClose: () => void;
    styles: any;
  }) => {
    const subtestCounters: Record<number, number> = {};

    return (
      <View style={styles.popoverOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.popoverBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.popoverContainer}>
          <View style={styles.popoverHeader}>
            <Text style={styles.popoverTitle}>Testni tanlang</Text>
          </View>
          <SectionList
            sections={
              groupedTestData.map((chapter) => ({
                title: `Test ${chapter[0]}`,
                data: chapter[1],
              })) ?? []
            }
            keyExtractor={(item, index) => item.id.toString() + index}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.subTestTitle}>{title}</Text>
            )}
            style={{
              padding: 4,
            }}
            renderItem={({ section, index }) => {
              const itemsPerRow = 8; // har qatorda 3 ta chiqadi
              const startIndex = index * itemsPerRow;
              const rowItems = section.data.slice(
                startIndex,
                startIndex + itemsPerRow,
              );

              return (
                <View style={styles.testGrid}>
                  {rowItems.map((item: any, i: any) => {
                    const { subTestNo: currentSubTestNo, dbQuestionNumber } =
                      item;

                    if (!subtestCounters[currentSubTestNo]) {
                      subtestCounters[currentSubTestNo] = 1;
                    } else {
                      subtestCounters[currentSubTestNo]++;
                    }

                    // const orderNumber = subtestCounters[currentSubTestNo];
                    const isAnswered = answers.find(
                      (a) => a.questionId === dbQuestionNumber,
                    )?.isConfirmed;
                    const isCurrent = dbQuestionNumber === currentQuestion;

                    return (
                      <TestGridItem
                        key={i}
                        testNumber={dbQuestionNumber}
                        orderNumber={item.questionNumber}
                        isAnswered={isAnswered}
                        isCurrent={isCurrent}
                        onSelect={onTestSelect}
                        styles={styles}
                      />
                    );
                  })}
                </View>
              );
            }}
            initialNumToRender={10}
            maxToRenderPerBatch={20}
            windowSize={2}
            scrollEnabled
            contentContainerStyle={styles.content}
          />
          <View style={styles.popoverArrow} />
        </View>
      </View>
    );
  },
);

// Alohida style sheet'lar
const headerTitleStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: 5,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
});

const headerRightStyles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 50,
    alignItems: "center",
  },
  text: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: "500",
  },
});

const loadingStyles = StyleSheet.create({
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
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
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
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    solutionViewImageContainer: {
      flex: 1,
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
      backgroundColor: theme.colors.background,
      paddingTop: SPACING.base,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    topControlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.background,
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
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.border,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: SPACING.xs,
    },
    optionButtonSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    optionButtonText: {
      fontSize: FONT_SIZES.base,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    optionButtonTextSelected: {
      color: COLORS.white,
    },
    customInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.sm,
      padding: SPACING.xs,
      paddingHorizontal: SPACING.sm,
      minHeight: 50,
      backgroundColor: theme.colors.card,
      justifyContent: "center",
    },
    customInputText: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
      fontFamily: "monospace",
    },
    customInputPlaceholder: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: SPACING.base,
    },
    actionButton: {
      flex: 1,
      paddingVertical: SPACING.sm,
      backgroundColor: theme.colors.background,
      borderRadius: BORDER_RADIUS.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    choiceButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    choiceButtonText: {
      fontSize: FONT_SIZES.base,
      color: theme.colors.text,
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
      bottom: moderateScale(200),
      left: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: theme.colors.background,
      paddingBottom: 10,
      borderRadius: BORDER_RADIUS.lg,
      maxHeight: 300,
      shadowColor: theme.colors.shadow,
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
      fontSize: FONT_SIZES.sm,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    testGridItemTextActive: {
      color: COLORS.white,
    },
    textInputContainer: {
      marginBottom: SPACING.base,
    },
    textInputLabel: {
      fontSize: FONT_SIZES.base,
      fontWeight: "500",
      color: COLORS.textMuted,
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
