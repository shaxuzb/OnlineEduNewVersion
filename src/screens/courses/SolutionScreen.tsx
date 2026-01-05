import { FontAwesome, Ionicons } from "@expo/vector-icons";
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
  Image,
  Modal,
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
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from "@/src/utils";
import { useTheme } from "@/src/context/ThemeContext";
import { useQuizResults, useTestPdf, useThemeTest } from "@/src/hooks/useQuiz";
import { AnswerKey, Theme } from "@/src/types";
import { CustomStyledCard } from "@/src/components/ui/cards/CustomStyledCard";
import LinearGradient from "react-native-linear-gradient";
import PageCard from "@/src/components/ui/cards/PageCard";
import { GestureViewer } from "react-native-gesture-image-viewer";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

interface LocalQuizAnswer {
  questionId: number;
  videoFileId: string;
  orderNumber: number;
  selectedOption: string | null;
  isConfirmed: boolean;
  isCorrect: boolean;
  photos: {
    fileId: string;
    relativePath: string;
  }[];
  correctAnswer: string;
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

const TestGridItem = React.memo(
  ({
    testNumber,
    orderNumber,
    isCurrent,
    isAnswered,
    isCorrect,
    onSelect,
    styles,
  }: {
    testNumber: number;
    orderNumber: number;
    isAnswered: any;
    isCurrent: boolean;
    isCorrect: any;
    onSelect: (testNumber: number) => void;
    styles: any;
  }) => (
    <TouchableOpacity key={testNumber} onPress={() => onSelect(testNumber)}>
      <LinearGradient
        start={{ x: 0.5, y: 1.0 }}
        end={{ x: 0.5, y: 0.0 }}
        colors={
          !isAnswered
            ? ["#e37900", "#ff8800"]
            : isCorrect
            ? ["#068000", "#11b502"]
            : ["#820000", "#b50000"]
        }
        style={[styles.testGridItem]}
      >
        <Text style={[styles.testGridItemText, styles.testGridItemTextActive]}>
          {orderNumber}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  )
);

export default function SolutionScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { themeId, userId, testId, mavzu, percent } = route.params;

  // API hooks
  const {
    data: quizResults,
    isLoading: resultsLoading,
    isSuccess: resultsSuccess,
    error: resultsError,
  } = useQuizResults(Number(userId), Number(themeId));

  const { data: pdfBlob, isLoading } = useTestPdf(Number(testId));
  const { data: testData } = useThemeTest(Number(testId));

  const [showTestIndex, setShowTestIndex] = useState(1);
  const [showSolution, setShowSolution] = useState(false);
  // State management
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [selectedOption, setSelectedOption] = useState<LocalQuizAnswer | null>(
    null
  );
  const [answers, setAnswers] = useState<LocalQuizAnswer[]>([]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  // Memoized values
  const totalQuestions = testData?.questionCount || 0;
  const currentAnswerKey = testData?.answerKeys?.find(
    (ak) => ak.dbQuestionNumber === currentQuestion
  );

  const isMultipleChoice = currentAnswerKey?.answerType === 1;

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
    if (resultsSuccess) {
      setAnswers(
        quizResults[0].answers.map((item) => ({
          correctAnswer: item.correctAnswer,
          isConfirmed: !!item.answer,
          videoFileId: item.answerFileId,
          photos: item.photos,
          isCorrect: item.isCorrect,
          questionId: item.dbQuestionNumber,
          orderNumber: item.questionNumber,
          selectedOption: item.answer,
        }))
      );
    }
  }, [resultsSuccess]);
  useEffect(() => {
    const savedAnswer = answers.find((a) => a.questionId === currentQuestion);
    if (savedAnswer) {
      setSelectedOption(savedAnswer);
    } else {
      setSelectedOption(null);
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
      ]
    );
  }, []);
  const handleTestSelect = useCallback((testNumber: number) => {
    setCurrentQuestion(testNumber);
  }, []);
  const handlePressSolutionVideo = useCallback(() => {
    if (selectedOption?.videoFileId) {
      navigation.navigate("VideoPlayer", {
        lessonTitle: `${selectedOption?.questionId}-test yechimi`,
        videoFileId: selectedOption.videoFileId,
        mavzu: `${selectedOption?.questionId}-test yechimi`,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Yechim videosi yuklanmagan!",
        visibilityTime: 1500,
      });
    }
  }, [selectedOption]);
  // Grouped test data for modal
  const groupedTestData = useMemo(() => {
    if (!testData?.answerKeys) return [];

    return Object.entries(
      testData.answerKeys
        .filter((item) => item.subTestNo === showTestIndex)
        .reduce((acc: any, key: any) => {
          const group = acc[key.subTestNo] || [];
          group.push(key);
          acc[key.subTestNo] = group;
          return acc;
        }, {})
    );
  }, [testData, showTestIndex]);
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
  const currentAnswer = useMemo(() => {
    return answers.find((item) => item.questionId === currentQuestion);
  }, [answers, currentQuestion]);
  useEffect(() => {
    navigation.setOptions({
      title: "IDS mavzulashtirilgan testlar to'plami",
      headerTitle: ({ children }: { children: any }) => (
        <HeaderTitle title={children} />
      ),
      freezeOnBlur: true,
      headerRight: () => <HeaderRight percent={percent} />,
    });
  }, [navigation]);
  // Loading and error states
  if (resultsLoading) {
    return <LoadingState />;
  }

  if (resultsError || !testData) {
    return <ErrorState onRetry={handleGoBack} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <PageCard>
        {/* PDF Content */}
        {showSolution ? (
          <View style={styles.solutionViewContainer}>
            <View style={styles.solutionViewHeader}>
              <Text style={styles.solutionViewTitle}>
                {currentAnswerKey?.questionNumber} - savol yechimi
              </Text>
              <TouchableOpacity
                style={[styles.solutionViewactionButton]}
                onPress={() => {
                  handlePressSolutionVideo();
                }}
              >
                <FontAwesome
                  name="play-circle"
                  color={theme.colors.text}
                  size={30}
                />
                <Text style={{ color: theme.colors.text }}>Video yechim</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.solutionViewImageContainer}>
              {currentAnswer && currentAnswer.photos.length > 0 ? (
                <ImageViewer
                  images={currentAnswer?.photos.map((item) => ({
                    fileId: item.fileId,
                    relativePath: `${Constants.expoConfig?.extra?.API_URL}${item.relativePath}`,
                  }))}
                  theme={theme}
                />
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

              {/* <Image
                source={{
                  uri: `${Constants.expoConfig?.extra?.API_URL}${currentAnswer?.photos[0].relativePath}`,
                  }}
                  style={styles.solutionViewImage}
                resizeMode="contain"
              /> */}
            </View>
          </View>
        ) : (
          <View style={styles.pdfContainer}>
            <PdfViewer testId={Number(testId)} authToken={authToken} />
          </View>
        )}

        {/* Quiz Controls */}
        <View style={styles.quizControls}>
          {showSolution && (
            <AnswerView answer={currentAnswer} styles={styles} />
          )}
          <TestModal
            groupedTestData={groupedTestData}
            answers={answers}
            currentQuestion={currentQuestion}
            onTestSelect={handleTestSelect}
            styles={styles}
          />
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
                size={20}
                style={{
                  flexGrow: 1,
                  width: 30,
                }}
                onPress={() => {
                  setShowTestIndex((prev) => prev - 1);
                }}
                disabled={showTestIndex === 1}
                color={showTestIndex === 1 ? COLORS.textMuted : COLORS.primary}
              />
              <Text style={{ color: theme.colors.text }}>
                {showTestIndex}-test
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
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
                  width: 30,
                  textAlign: "right",
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={{
                flexGrow: 1,
              }}
              onPress={() => setShowSolution(!showSolution)}
            >
              <CustomStyledCard style={styles.finishButton}>
                <Text style={styles.choiceButtonText}>
                  {showSolution ? "Pdf kitobini ko'rish" : "Yechimlarni kurish"}
                </Text>
              </CustomStyledCard>
            </TouchableOpacity>
          </View>
        </View>
      </PageCard>
    </SafeAreaView>
  );
}

const TestModal = React.memo(
  ({
    groupedTestData,
    answers,
    currentQuestion,
    onTestSelect,
    styles,
  }: {
    groupedTestData: [string, any][];
    answers: LocalQuizAnswer[];
    currentQuestion: number;
    onTestSelect: (testNumber: number) => void;
    styles: any;
  }) => {
    const subtestCounters: Record<number, number> = {};

    return (
      <View style={styles.popoverContainer}>
        <View style={styles.popoverHeader}>
          <Text style={styles.popoverTitle}>{groupedTestData[0][0]}-test</Text>
          <Text style={styles.popoverTitle}>{currentQuestion}/20</Text>
        </View>
        <SectionList
          sections={
            groupedTestData.map((chapter) => ({
              title: `Test ${chapter[0]}`,
              data: chapter[1],
            })) ?? []
          }
          keyExtractor={(item, index) => item.id.toString() + index}
          style={{
            padding: 2,
          }}
          renderItem={({ section, index }) => {
            const itemsPerRow = 100; // har qatorda 3 ta chiqadi
            const startIndex = index * itemsPerRow;
            const rowItems = section.data.slice(
              startIndex,
              startIndex + itemsPerRow
            );

            return (
              <View style={styles.testGrid}>
                {rowItems.map((item: any) => {
                  const { subTestNo: currentSubTestNo, dbQuestionNumber } =
                    item;

                  if (!subtestCounters[currentSubTestNo]) {
                    subtestCounters[currentSubTestNo] = 1;
                  } else {
                    subtestCounters[currentSubTestNo]++;
                  }
                  const isCorrect = answers.find(
                    (a) => a.questionId === item.dbQuestionNumber
                  )?.isCorrect;
                  const orderNumber = item.questionNumber;
                  const isAnswered = answers.find(
                    (a) => a.questionId === dbQuestionNumber
                  )?.isConfirmed;
                  const isCurrent = dbQuestionNumber === currentQuestion;

                  return (
                    <TestGridItem
                      key={dbQuestionNumber}
                      testNumber={dbQuestionNumber}
                      orderNumber={orderNumber}
                      isAnswered={isAnswered}
                      isCurrent={isCurrent}
                      isCorrect={isCorrect}
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
      </View>
    );
  }
);
const ImageViewer = React.memo(
  ({ images, theme }: { images: LocalQuizAnswer["photos"]; theme: Theme }) => {
    const [visible, setVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const scrollRef = useRef<Animated.ScrollView>(null);
    const renderImage = useCallback((imageUrl: string) => {
      return (
        <Image
          source={{ uri: imageUrl }}
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
                source={{ uri: img.relativePath }}
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
  }
);
const AnswerView = React.memo(
  ({
    answer,
    styles,
  }: {
    answer: LocalQuizAnswer | undefined;
    styles: any;
  }) => {
    return (
      <View style={styles.answerViewContainer}>
        <View>
          <Text style={styles.answerViewText}>
            To'g'ri javob: {answer?.correctAnswer}
          </Text>
          <Text style={styles.answerViewText}>
            Belgilangan javob:{" "}
            {answer?.selectedOption === "" ? "Bo'sh" : answer?.selectedOption}
          </Text>
        </View>
        <View>
          <Image
            style={{
              width: 45,
              height: 45,
            }}
            source={
              !answer?.isConfirmed
                ? require("@/src/assets/icons/solution/noanswer.png")
                : answer?.isCorrect
                ? require("@/src/assets/icons/solution/correct.png")
                : require("@/src/assets/icons/solution/incorrect.png")
            }
            resizeMode="center"
          />
        </View>
      </View>
    );
  }
);

// Alohida style sheet'lar
const headerTitleStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: 5,
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.lg),
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.white,
  },
});

const headerRightStyles = StyleSheet.create({
  container: {
    minWidth: 50,
    alignItems: "center",
  },
  text: {
    fontSize: moderateScale(FONT_SIZES.lg),
    color: COLORS.white,
    fontWeight: "900",
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
    marginTop: moderateScale(SPACING.base),
    fontSize: moderateScale(FONT_SIZES.base),
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
    paddingHorizontal: moderateScale(SPACING.xl),
  },
  title: {
    fontSize: moderateScale(FONT_SIZES.xl),
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: moderateScale(SPACING.base),
    textAlign: "center",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(SPACING.xl),
    paddingVertical: moderateScale(SPACING.base),
    borderRadius: moderateScale(BORDER_RADIUS.base),
    marginTop: moderateScale(SPACING.xl),
  },
  buttonText: {
    fontSize: moderateScale(FONT_SIZES.base),
    color: COLORS.white,
    fontWeight: "500",
  },
});

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    pdfContainer: {
      flex: 1,
      backgroundColor: theme.colors.card,
    },
    pdf: {
      flex: 1,
      width: width,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: moderateScale(SPACING.xl),
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
      paddingTop: moderateScale(SPACING.base),
      paddingHorizontal: moderateScale(SPACING.sm),
      paddingBottom: moderateScale(SPACING.lg),
    },
    questionNumber: {
      fontSize: moderateScale(FONT_SIZES.base),
      fontWeight: "bold",
      color: theme.colors.text,
      marginHorizontal: SPACING.sm,
    },
    actionContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: SPACING.base,
    },
    actionButton: {
      paddingVertical: moderateScale(SPACING.xs),
      backgroundColor: theme.colors.card,
      borderRadius: moderateScale(BORDER_RADIUS.base),
      marginTop: moderateScale(SPACING.sm),
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
      color: "white",
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
    finishButton: {
      backgroundColor: "#e74c3c",
      paddingVertical: moderateScale(SPACING.sm),
      borderRadius: moderateScale(BORDER_RADIUS.base),
      marginTop: moderateScale(SPACING.sm),
      flexDirection: "row",
      alignItems: "center",
      flexShrink: 0,
      flexGrow: 1,
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    popoverContainer: {
      backgroundColor: theme.colors.card,
      paddingHorizontal: 6,
      paddingBottom: 6,
      borderColor: theme.colors.inputBorder,
      borderWidth: 1,
      borderRadius: moderateScale(BORDER_RADIUS.lg),
    },
    popoverHeader: {
      paddingHorizontal: moderateScale(SPACING.xs),
      paddingVertical: moderateScale(SPACING.xs),
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
    },
    popoverTitle: {
      fontSize: moderateScale(FONT_SIZES.sm),
      fontWeight: "bold",
      color: theme.colors.text,
    },
    popoverContent: {
      paddingHorizontal: moderateScale(SPACING.lg),
      paddingVertical: moderateScale(SPACING.sm),
      maxHeight: 220,
    },

    subTestTitle: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    testGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    testGridItem: {
      width: (30 / 400) * width,
      aspectRatio: 1 / 1,
      borderRadius: 10,
      backgroundColor: theme.colors.border,
      borderColor: theme.colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    testGridItemAnswered: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    testGridItemCurrent: {
      backgroundColor: "#fc8b00",
      borderColor: "#fc8b00",
    },
    testGridItemText: {
      fontSize: FONT_SIZES.sm,
      fontWeight: "700",
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

    answerViewContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    answerViewText: {
      fontSize: FONT_SIZES.xl,
      color: theme.colors.text,
    },
    solutionViewContainer: {
      flex: 1,
      backgroundColor: theme.colors.card,
      paddingTop: SPACING.xl,
    },
    solutionViewHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",

      padding: SPACING.sm,
    },
    solutionViewTitle: {
      fontSize: FONT_SIZES.xl,
      color: theme.colors.text,
      fontWeight: "700",
    },
    solutionViewactionButton: {
      paddingVertical: 0,
      paddingHorizontal: SPACING.sm,
      flexDirection: "row",
      gap: SPACING.sm,
      backgroundColor: theme.colors.card,
      borderRadius: BORDER_RADIUS.lg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    solutionViewImageContainer: {
      flex: 1,
    },
    solutionViewImage: {
      flex: 1,
    },
  });
