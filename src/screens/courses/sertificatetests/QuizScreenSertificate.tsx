import { Ionicons } from "@expo/vector-icons";
import * as ScreenCapture from "expo-screen-capture";
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
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Platform,
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
import { QuizAnswer, Theme } from "@/src/types";
import { moderateScale } from "react-native-size-matters";
import MathView from "react-native-math-view";
import MathLiveModalKeyboard, {
  MathLiveModalRef,
} from "@/src/components/MathKeyboard";
import {
  useFocusEffect,
  useIsFocused,
  usePreventRemove,
} from "@react-navigation/native";
import ScreenGuardModule from "react-native-screenguard";

const { width } = Dimensions.get("window");
const TIMED_TEST_DURATION_SECONDS = 2.5 * 60 * 60;

interface LocalQuizAnswer {
  answerKeyId: number;
  questionId: number;
  partIndex: number;
  selectedOption: string | null;
  subTestNo: number;
  isConfirmed: boolean;
}

interface TextAnswerEditorState {
  answerKeyId: number;
  questionId: number;
  partIndex: number;
  subTestNo: number;
  value: string;
}

interface ModalHeaderRow {
  type: "header";
  key: string;
  subTestNo: string;
}

interface ModalQuestionRow {
  type: "question";
  key: string;
  subTestNo: number;
  dbQuestionNumber: number;
  questionNumber: number;
  answerType: number;
  options: string[];
  parts: { answerKeyId: number; partIndex: number; partLabel: string | null }[];
}

type ModalListRow = ModalHeaderRow | ModalQuestionRow;

const MODAL_ROW_HEADER_HEIGHT = moderateScale(28);
const MODAL_ROW_OPTION_HEIGHT = moderateScale(64);
const MODAL_ROW_TEXT_BASE_HEIGHT = moderateScale(64);
const MODAL_ROW_TEXT_PART_HEIGHT = moderateScale(52);

const HeaderTitle = React.memo(
  ({ title, subtitle }: { title: string; subtitle: string }) => (
    <View style={headerTitleStyles.container}>
      <Text style={headerTitleStyles.title}>{title}</Text>
      <Text style={headerTitleStyles.subtitle}>{subtitle}</Text>
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

const PdfViewer = React.memo(
  ({ testId, authToken }: { testId: number; authToken: string | null }) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleLoadComplete = useCallback((numberOfPages: number) => {
      console.log("PDF loaded with", numberOfPages, "pages");
    }, []);

    const handleError = useCallback((error: unknown) => {
      Alert.alert(
        "Xatolik",
        "PDF faylni ochishda xatolik yuz berdi. Fayl mavjudligini tekshiring.",
        [{ text: "OK" }],
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
          cache: false,
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
  },
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
    isSelected: boolean;
    disabled: boolean;
    onSelect: (option: string) => void;
    styles: ReturnType<typeof createStyles>;
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
        numberOfLines={1}
      >
        {option}
      </Text>
    </TouchableOpacity>
  ),
);

const ModalQuestionRowItem = React.memo(
  ({
    item,
    answersByKey,
    onSelectOption,
    onOpenMathInput,
    styles,
  }: {
    item: ModalQuestionRow;
    answersByKey: Record<number, LocalQuizAnswer>;
    onSelectOption: (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      option: string,
      subTestNo: number,
    ) => void;
    onOpenMathInput: (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      subTestNo: number,
      value: string,
    ) => void;
    styles: ReturnType<typeof createStyles>;
  }) => {
    const primaryPart = item.parts[0];
    const selected = primaryPart
      ? (answersByKey[primaryPart.answerKeyId]?.selectedOption ?? null)
      : null;

    return (
      <View
        style={[
          styles.modalQuestionCard,
          item.answerType === 1 && {
            flexDirection: "row",
            gap: 4,
            alignItems: "center",
          },
        ]}
      >
        <Text style={styles.modalQuestionTitle}>{item.questionNumber}</Text>

        {item.answerType === 1 && item.options.length > 0 ? (
          <View style={styles.modalOptionsRow}>
            {item.options.map((option) => (
              <OptionButton
                key={`${item.dbQuestionNumber}-${option}`}
                option={option}
                disabled={false}
                isSelected={selected === option}
                onSelect={(value) =>
                  onSelectOption(
                    primaryPart?.answerKeyId ?? item.dbQuestionNumber,
                    item.dbQuestionNumber,
                    primaryPart?.partIndex ?? 0,
                    value,
                    item.subTestNo,
                  )
                }
                styles={styles}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.modalTextPartsContainer]}>
            {item.parts.map((part, idx) => {
              const partValue = answersByKey[part.answerKeyId]?.selectedOption ?? "";
              return (
                <View
                  key={`${item.key}-part-${part.answerKeyId}`}
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    },
                  ]}
                >
                  {item.parts.length > 1 && (
                    <Text style={styles.modalPartLabel}>
                      {part.partLabel || `${idx + 1}-qism`}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.modalMathInput}
                    onPress={() =>
                      onOpenMathInput(
                        part.answerKeyId,
                        item.dbQuestionNumber,
                        part.partIndex,
                        item.subTestNo,
                        partValue,
                      )
                    }
                    activeOpacity={0.85}
                  >
                    {partValue ? (
                      <MathView math={partValue} style={styles.modalMathPreview} />
                    ) : (
                      <Text style={styles.modalMathPlaceholder}>
                        Javobni kiriting
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  },
  (prev, next) => {
    if (prev.item !== next.item || prev.styles !== next.styles) {
      return false;
    }

    const prevParts = prev.item.parts;
    const nextParts = next.item.parts;
    if (prevParts.length !== nextParts.length) {
      return false;
    }

    for (let i = 0; i < prevParts.length; i += 1) {
      const prevPart = prevParts[i];
      const nextPart = nextParts[i];
      if (prevPart.answerKeyId !== nextPart.answerKeyId) {
        return false;
      }

      const prevSelected =
        prev.answersByKey[prevPart.answerKeyId]?.selectedOption ?? null;
      const nextSelected =
        next.answersByKey[nextPart.answerKeyId]?.selectedOption ?? null;

      if (prevSelected !== nextSelected) {
        return false;
      }
    }

    return true;
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
  const { testId, mavzu, testMode } = route.params;
  const numericTestId = Number(testId);
  const isTimedMode = testMode !== "untimed";

  const {
    data: testData,
    isLoading: testLoading,
    error: testError,
  } = useThemeTest(numericTestId);

  const submitResults = useSubmitTestResults();
  const currentUserId = useCurrentUserId();

  const [answersByKey, setAnswersByKey] = useState<
    Record<number, LocalQuizAnswer>
  >({});
  const [showTestModal, setShowTestModal] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [remainingSecondsDisplay, setRemainingSecondsDisplay] = useState(
    TIMED_TEST_DURATION_SECONDS,
  );
  const remainingSecondsRef = useRef(TIMED_TEST_DURATION_SECONDS);
  const hasTimedOutRef = useRef(false);
  const hasSubmittedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const isScreenGuardEnabledRef = useRef(false);
  const guardRequestIdRef = useRef(0);
  const mathKeyboardRef = useRef<MathLiveModalRef>(null);
  const [activeTextAnswer, setActiveTextAnswer] =
    useState<TextAnswerEditorState | null>(null);
  const testModalScrollYRef = useRef(0);
  const handleTestModalScrollYChange = useCallback((value: number) => {
    testModalScrollYRef.current = value;
  }, []);
  const openTestModal = useCallback(() => {
    setShowTestModal(true);
  }, []);
  const closeTestModal = useCallback(() => {
    setShowTestModal(false);
  }, []);

  const setScreenProtectionEnabled = useCallback((enabled: boolean) => {
    if (Platform.OS === "ios") {
      if (isScreenGuardEnabledRef.current === enabled) return;
      isScreenGuardEnabledRef.current = enabled;
      const requestId = ++guardRequestIdRef.current;

      (async () => {
        try {
          if (enabled) {
            try {
              await ScreenGuardModule.unregister();
            } catch {}

            await ScreenGuardModule.initSettings({
              displayScreenGuardOverlay: false,
              timeAfterResume: 500,
              getScreenshotPath: false,
            });

            if (
              guardRequestIdRef.current !== requestId ||
              !isScreenGuardEnabledRef.current
            ) {
              return;
            }

            await ScreenGuardModule.registerWithBlurView({
              radius: 20,
            });
            return;
          }

          await ScreenGuardModule.unregister();
        } catch (error) {
          console.warn("Quiz iOS ScreenGuard error:", error);
        }
      })();

      return;
    }

    if (Platform.OS === "android") {
      if (enabled) {
        ScreenCapture.preventScreenCaptureAsync().catch(console.warn);
      } else {
        ScreenCapture.allowScreenCaptureAsync().catch(console.warn);
      }
    }
  }, []);

  const totalQuestions = useMemo(
    () => testData?.questionCount || 0,
    [testData],
  );
  const answers = useMemo(() => Object.values(answersByKey), [answersByKey]);

  const formattedRemainingTime = useMemo(() => {
    const hours = Math.floor(remainingSecondsDisplay / 3600);
    const minutes = Math.floor((remainingSecondsDisplay % 3600) / 60);
    const seconds = remainingSecondsDisplay % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSecondsDisplay]);

  const groupedTestData = useMemo(() => {
    if (!testData?.answerKeys) return [] as [string, any[]][];

    return Object.entries(
      testData.answerKeys.reduce((acc: Record<string, any[]>, key: any) => {
        if (!acc[key.subTestNo]) {
          acc[key.subTestNo] = [];
        }
        acc[key.subTestNo].push(key);
        return acc;
      }, {}),
    );
  }, [testData]);

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

  const handleGoBack = useCallback(() => {
    Alert.alert(
      "Testni tark etish",
      "Haqiqatan ham testni tark etmoqchimisiz?",
      [
        {
          text: "Bekor qilish",
          style: "cancel",
        },
        {
          text: "Chiqish",
          onPress: () => {
            isLeavingRef.current = true;
            navigation.goBack();
          },
        },
      ],
      {
        cancelable: true,
      },
    );
    return true;
  }, [navigation]);

  const handleOptionSelectForQuestion = useCallback(
    (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      option: string,
      subTestNo: number,
    ) => {
      setAnswersByKey((prev) => {
        const existing = prev[answerKeyId];
        if (
          existing &&
          existing.selectedOption === option &&
          existing.questionId === questionId &&
          existing.partIndex === partIndex &&
          existing.subTestNo === subTestNo &&
          existing.isConfirmed
        ) {
          return prev;
        }

        return {
          ...prev,
          [answerKeyId]: {
            answerKeyId,
            questionId,
            partIndex,
            selectedOption: option,
            subTestNo,
            isConfirmed: true,
          },
        };
      });
    },
    [],
  );

  const handleOpenMathInput = useCallback(
    (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      subTestNo: number,
      value: string,
    ) => {
      const initialValue = value || "";
      setActiveTextAnswer({
        answerKeyId,
        questionId,
        partIndex,
        subTestNo,
        value: initialValue,
      });

      setTimeout(() => {
        mathKeyboardRef.current?.show();
        mathKeyboardRef.current?.updateValue(initialValue);
      }, 60);
    },
    [],
  );

  const handleMathKeyboardChange = useCallback(
    (newValue: string) => {
      setActiveTextAnswer((prev) => {
        if (!prev) return prev;
        handleOptionSelectForQuestion(
          prev.answerKeyId,
          prev.questionId,
          prev.partIndex,
          newValue,
          prev.subTestNo,
        );
        return { ...prev, value: newValue };
      });
    },
    [handleOptionSelectForQuestion],
  );

  const handleFinishTest = useCallback(
    async (options?: { autoSubmit?: boolean }) => {
      const isAutoSubmit = options?.autoSubmit === true;

      if (submitResults.isPending || hasSubmittedRef.current) {
        return;
      }

      if (!currentUserId || !numericTestId) {
        Alert.alert("Xatolik", "Foydalanuvchi ma'lumotlari topilmadi");
        return;
      }

      const confirmedAnswers = answers.filter((a) => a.isConfirmed);
      const answeredQuestions = new Set(
        confirmedAnswers.map((a) => a.questionId),
      ).size;
      const unansweredCount = Math.max(totalQuestions - answeredQuestions, 0);

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

      const submissionAnswers: QuizAnswer[] = confirmedAnswers.map((answer) => {
        const questionId = answer.questionId;
        const relatedKeys = groupedAnswerKeys[questionId] || [];

        if (relatedKeys.length <= 1) {
          return {
            questionNumber: questionId,
            subTestNo: answer.subTestNo,
            partIndex: 0,
            answer: answer.selectedOption || "",
          };
        }

        return {
          questionNumber: questionId,
          subTestNo: answer.subTestNo,
          partIndex: answer.partIndex || 1,
          answer: answer.selectedOption || "",
        };
      });

      const submitAndNavigate = async () => {
        try {
          hasSubmittedRef.current = true;
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
        } catch (error) {
          hasSubmittedRef.current = false;
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
      };

      if (isAutoSubmit) {
        await submitAndNavigate();
        return;
      }

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
            onPress: submitAndNavigate,
          },
        ],
      );
    },
    [
      answers,
      currentUserId,
      numericTestId,
      totalQuestions,
      testData,
      submitResults,
      navigation,
      mavzu,
    ],
  );

  useEffect(() => {
    if (!isTimedMode || submitResults.isPending) return;

    const timer = setInterval(() => {
      const nextValue =
        remainingSecondsRef.current > 0 ? remainingSecondsRef.current - 1 : 0;
      remainingSecondsRef.current = nextValue;

      const shouldUpdateDisplay =
        !showTestModal || nextValue === 0 || nextValue % 5 === 0;
      if (shouldUpdateDisplay) {
        setRemainingSecondsDisplay(nextValue);
      }

      if (nextValue === 0 && !hasTimedOutRef.current) {
        hasTimedOutRef.current = true;
        handleFinishTest({ autoSubmit: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimedMode, submitResults.isPending, showTestModal, handleFinishTest]);

  usePreventRemove(isFocused, ({ data }) => {
    Alert.alert(
      "Testni tark etish",
      "Haqiqatan ham testni tark etmoqchimisiz?",
      [
        {
          text: "Bekor qilish",
          style: "cancel",
        },
        {
          text: "Chiqish",
          onPress: () => {
            isLeavingRef.current = true;
            navigation.dispatch(data.action);
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  });

  useFocusEffect(
    useCallback(() => {
      isLeavingRef.current = false;
      setScreenProtectionEnabled(true);

      return () => {
        setScreenProtectionEnabled(false);
      };
    }, [setScreenProtectionEnabled]),
  );

  useEffect(() => {
    navigation.setOptions({
      title: mavzu,
      headerTitle: () => (
        <HeaderTitle
          title={mavzu}
          subtitle={isTimedMode ? `Qolgan vaqt: ${formattedRemainingTime}` : ""}
        />
      ),
      headerBackTitle: "Orqaga",
      freezeOnBlur: true,
    });
  }, [navigation, isTimedMode, formattedRemainingTime, mavzu]);

  if (testLoading) {
    return <LoadingState />;
  }

  if (testError || !testData) {
    return <ErrorState onRetry={handleGoBack} />;
  }

  if (!isTimedMode) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.pdfContainer}>
          <PdfViewer testId={numericTestId} authToken={authToken} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.pdfContainer}>
        <PdfViewer testId={numericTestId} authToken={authToken} />
      </View>

      <View style={styles.quizControls}>
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={openTestModal}
            disabled={submitResults.isPending}
          >
            <Text style={styles.confirmButtonText}>Belgilash</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={() => handleFinishTest()}
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

      {showTestModal && (
        <TestModal
          groupedTestData={groupedTestData}
          answersByKey={answersByKey}
          onSelectOption={handleOptionSelectForQuestion}
          onOpenMathInput={handleOpenMathInput}
          initialScrollY={testModalScrollYRef.current}
          onScrollYChange={handleTestModalScrollYChange}
          onClose={closeTestModal}
          styles={styles}
        />
      )}

      <MathLiveModalKeyboard
        ref={mathKeyboardRef}
        value={activeTextAnswer?.value ?? ""}
        onChange={handleMathKeyboardChange}
        onClose={() => setActiveTextAnswer(null)}
      />
    </SafeAreaView>
  );
}

const TestModal = React.memo(
  ({
    groupedTestData,
    answersByKey,
    onSelectOption,
    onOpenMathInput,
    initialScrollY,
    onScrollYChange,
    onClose,
    styles,
  }: {
    groupedTestData: [string, any[]][];
    answersByKey: Record<number, LocalQuizAnswer>;
    onSelectOption: (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      option: string,
      subTestNo: number,
    ) => void;
    onOpenMathInput: (
      answerKeyId: number,
      questionId: number,
      partIndex: number,
      subTestNo: number,
      value: string,
    ) => void;
    initialScrollY: number;
    onScrollYChange: (value: number) => void;
    onClose: () => void;
    styles: ReturnType<typeof createStyles>;
  }) => {
    const listRef = useRef<FlatList<ModalListRow>>(null);
    const flatRows = useMemo<ModalListRow[]>(() => {
      const rows: ModalListRow[] = [];

      groupedTestData.forEach(([subTest, items]) => {
        rows.push({
          type: "header",
          key: `header-${subTest}`,
          subTestNo: String(subTest),
        });

        const groupedByQuestion = (items as any[]).reduce(
          (acc: Record<number, any[]>, key: any) => {
            if (!acc[key.dbQuestionNumber]) {
              acc[key.dbQuestionNumber] = [];
            }
            acc[key.dbQuestionNumber].push(key);
            return acc;
          },
          {},
        );

        Object.values(groupedByQuestion).forEach((sameQuestionItems) => {
          const sortedParts = [...sameQuestionItems].sort(
            (a: any, b: any) => (a.partIndex ?? 0) - (b.partIndex ?? 0),
          );
          const base = sortedParts[0];

          let parsedOptions: string[] = [];
          if (base.options) {
            try {
              parsedOptions = JSON.parse(base.options);
            } catch {
              parsedOptions = [];
            }
          }

          rows.push({
            type: "question",
            key: `q-${base.dbQuestionNumber}-${subTest}`,
            subTestNo: (base.subTestNo ?? Number(subTest)) || 1,
            dbQuestionNumber: base.dbQuestionNumber,
            questionNumber: base.questionNumber,
            answerType: base.answerType,
            options: parsedOptions,
            parts: sortedParts.map((p: any) => ({
              answerKeyId: p.id,
              partIndex: p.partIndex ?? 0,
              partLabel: p.partLabel ?? null,
            })),
          });
        });
      });

      return rows;
    }, [groupedTestData]);

    const rowLayouts = useMemo(() => {
      const layouts: Array<{ length: number; offset: number; index: number }> = [];
      let offset = 0;

      flatRows.forEach((row, index) => {
        let length = MODAL_ROW_HEADER_HEIGHT;

        if (row.type === "question") {
          if (row.answerType === 1) {
            length = MODAL_ROW_OPTION_HEIGHT;
          } else {
            length =
              MODAL_ROW_TEXT_BASE_HEIGHT +
              Math.max(0, row.parts.length - 1) * MODAL_ROW_TEXT_PART_HEIGHT;
          }
        }

        layouts.push({ length, offset, index });
        offset += length;
      });

      return layouts;
    }, [flatRows]);

    const getItemLayout = useCallback(
      (_data: ArrayLike<ModalListRow> | null | undefined, index: number) => {
        const layout = rowLayouts[index];
        if (layout) return layout;
        return {
          length: MODAL_ROW_OPTION_HEIGHT,
          offset: MODAL_ROW_OPTION_HEIGHT * index,
          index,
        };
      },
      [rowLayouts],
    );

    const handleListScroll = useCallback(
      (event: any) => {
        onScrollYChange(event.nativeEvent.contentOffset.y);
      },
      [onScrollYChange],
    );

    useEffect(() => {
      const id = setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: initialScrollY,
          animated: false,
        });
      }, 0);

      return () => clearTimeout(id);
    }, []);

    const renderRow = useCallback(
      ({ item }: ListRenderItemInfo<ModalListRow>) => {
        if (item.type === "header") {
          return <Text style={styles.subTestTitle}>Test {item.subTestNo}</Text>;
        }

        return (
          <ModalQuestionRowItem
            item={item}
            answersByKey={answersByKey}
            onSelectOption={onSelectOption}
            onOpenMathInput={onOpenMathInput}
            styles={styles}
          />
        );
      },
      [answersByKey, onOpenMathInput, onSelectOption, styles],
    );

    return (
      <View style={styles.popoverOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.popoverBackground}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.popoverContainer}>
          <View style={styles.popoverHeader}>
            <Text style={styles.popoverTitle}>Barcha savollar</Text>
          </View>

          <FlatList
            ref={listRef}
            style={styles.modalQuestionList}
            contentContainerStyle={styles.modalQuestionListContent}
            data={flatRows}
            keyExtractor={(item) => item.key}
            renderItem={renderRow}
            getItemLayout={getItemLayout}
            showsVerticalScrollIndicator={false}
            onScroll={handleListScroll}
            scrollEventThrottle={16}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={6}
            updateCellsBatchingPeriod={30}
            removeClippedSubviews
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.popoverFooter}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseText}>Yopish</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.popoverArrow} />
        </View>
      </View>
    );
  },
);

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
    quizControls: {
      position: "relative",
      backgroundColor: theme.colors.background,
      paddingTop: SPACING.base,
      paddingHorizontal: SPACING.lg,
      paddingBottom: SPACING.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
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
    confirmButton: {
      backgroundColor: COLORS.primary,
      flexDirection: "row",
      alignItems: "center",
    },
    confirmButtonText: {
      fontSize: FONT_SIZES.base,
      color: COLORS.white,
      fontWeight: "600",
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
      backgroundColor: "rgba(0, 0, 0, 0.15)",
    },
    popoverContainer: {
      position: "absolute",
      bottom: moderateScale(120),
      left: SPACING.lg,
      right: SPACING.lg,
      backgroundColor: theme.colors.background,
      borderRadius: BORDER_RADIUS.lg,
      maxHeight: "75%",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
      overflow: "hidden",
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
    modalQuestionList: {
      maxHeight: "100%",
    },
    modalQuestionListContent: {
      paddingHorizontal: SPACING.base,
      paddingTop: SPACING.xs,
      paddingBottom: SPACING.xs,
      gap: 2,
    },
    modalSection: {
      paddingVertical: SPACING.xs,
    },
    subTestTitle: {
      fontSize: FONT_SIZES.base,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
    },
    modalQuestionCard: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.sm,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.sm,
      marginBottom: SPACING.xs,
    },
    modalQuestionTitle: {
      fontSize: FONT_SIZES.base,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: SPACING.xs,
    },
    modalOptionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      flexWrap: "nowrap",
      gap: SPACING.xs,
    },
    optionButton: {
      minWidth: 44,
      height: 36,
      borderRadius: 18,
      paddingHorizontal: SPACING.sm,
      backgroundColor: theme.colors.border,
      borderWidth: 1,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    optionButtonSelected: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    optionButtonText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "700",
      color: theme.colors.text,
    },
    optionButtonTextSelected: {
      color: COLORS.white,
    },
    modalMathInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: theme.colors.background,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      minHeight: 44,
      flexGrow: 1,
      marginBottom: SPACING.xs,
      justifyContent: "center",
    },
    modalMathPreview: {
      fontSize: moderateScale(12),
      color: theme.colors.text,
 
    },
    modalMathPlaceholder: {
      color: theme.colors.textSecondary,
      fontSize: FONT_SIZES.sm,
    },
    modalTextPartsContainer: {
      gap: SPACING.xs,
    },
    modalPartLabel: {
      color: theme.colors.textSecondary,
      fontSize: FONT_SIZES.xs,
      marginBottom: moderateScale(4),
      fontWeight: "600",
    },
    modalTextQuestionHint: {
      color: theme.colors.textSecondary,
      fontSize: FONT_SIZES.sm,
    },
    popoverFooter: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      padding: SPACING.sm,
      backgroundColor: theme.colors.background,
    },
    modalCloseButton: {
      alignSelf: "center",
      paddingHorizontal: SPACING.base,
      paddingVertical: SPACING.xs,
      borderRadius: BORDER_RADIUS.sm,
      backgroundColor: theme.colors.border,
    },
    modalCloseText: {
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: FONT_SIZES.sm,
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
      borderTopColor: theme.colors.background,
    },
  });
