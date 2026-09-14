import EmptyData from "@/src/components/exceptions/EmptyData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemes } from "@/src/hooks/useThemes";
import { CoursesStackParamList } from "@/src/navigation/coursesTypes";
import { RootStackParamList } from "@/src/navigation/rootTypes";
import { isMockTestChapter } from "@/src/services/mockTestUtils";
import {
  ChapterTheme,
  MockTestChapter,
  SubjectChapter,
  Theme,
} from "@/src/types";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PageCard from "@/src/components/ui/cards/PageCard";
import { moderateScale } from "react-native-size-matters";
import { modalService } from "@/src/components/modals/modalService";
import { alertService } from "@/src/components/modals/customalert/alertService";
import MockTestCard from "@/src/components/courses/MockTestCard";

type SubjectListItem = ChapterTheme | MockTestChapter;
type SubjectSection = {
  title: string;
  data: SubjectListItem[];
  isMockTest: boolean;
};
type Props = CompositeScreenProps<
  NativeStackScreenProps<CoursesStackParamList, "SubjectScreen">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function SubjectScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { subjectId, subjectName, percent, subjectCode } = route.params;

  const { data, isLoading, isError, refetch } = useThemes(subjectId);

  const sections = useMemo<SubjectSection[]>(
    () =>
      data?.results?.map((chapter: SubjectChapter) => ({
        title: chapter.name,
        data: isMockTestChapter(chapter) ? [chapter] : chapter.themes,
        isMockTest: isMockTestChapter(chapter),
      })) ?? [],
    [data?.results],
  );

  const handleThemePress = useCallback(
    (chapterTheme: ChapterTheme) => {
      if (!chapterTheme.hasAccess) {
        modalService.open();
        return;
      }

      if (subjectCode === "NATIONAL_CERTIFICATE") {
        if (!chapterTheme.testId) {
          alertService.open({
            type: "warning",
            title: "Test tayyor emas",
            description:
              "Test hali yuklanmagan. Tayyor bo‘lgach, siz uni boshlashingiz mumkin.",
            showCancel: false,
            okText: "Yopish",
          });
          return;
        }

        alertService.open({
          type: "default",
          iconName: "time-outline",
          title: "Imtihon rejimini tanlang",
          description: "Testni qanday ishlamoqchisiz?",
          cancelText: "Bekor qilish",
          secondaryText: "Vaqtga qo'ymasdan",
          okText: "Vaqtga qo'yib",
          onSecondary: () => {
            navigation.navigate("QuizScreenSertificate", {
              testId: chapterTheme.testId,
              mavzu: `${chapterTheme.ordinalNumber}-MS imtihoni`,
              testMode: "untimed",
            });
          },
          onOk: () => {
            navigation.navigate("QuizScreenSertificate", {
              testId: chapterTheme.testId,
              mavzu: `${chapterTheme.ordinalNumber}-MS imtihoni`,
              testMode: "timed",
            });
          },
        });
        return;
      }

      navigation.navigate("LessonDetail", {
        themeId: chapterTheme.id,
        percent: chapterTheme.percent,
        themeOrdinalNumber: chapterTheme.ordinalNumber,
        themeName: chapterTheme.name,
      });
    },
    [navigation, subjectCode],
  );

  const handleMockTestPress = useCallback(
    (chapter: MockTestChapter) => {
      if (!chapter.hasAccess) {
        modalService.open();
        return;
      }

      navigation.navigate("MockQuizScreen", {
        mockTestId: chapter.mockTestId,
        mockTestName: chapter.mockTestName || chapter.name,
        subjectId: chapter.subjectId,
      });
    },
    [navigation],
  );

  const keyExtractor = useCallback((item: SubjectListItem) => {
    return isMockTestChapter(item)
      ? `mock-${item.mockTestId}`
      : `theme-${item.id}`;
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SubjectSection }) =>
      section.isMockTest ? null : (
        <Text style={styles.chapterSectionTitle}>{section.title}</Text>
      ),
    [styles.chapterSectionTitle],
  );

  const renderItem = useCallback(
    ({ item }: { item: SubjectListItem }) => {
      if (isMockTestChapter(item)) {
        return (
          <MockTestCard
            chapter={item}
            onPress={() => handleMockTestPress(item)}
          />
        );
      }

      const chapterTheme = item;
      return (
        <TouchableOpacity
          style={[
            styles.themeCard,
            !chapterTheme.hasAccess && styles.lockedThemeCard,
          ]}
          activeOpacity={0.8}
          onPress={() => handleThemePress(chapterTheme)}
        >
          {!chapterTheme.hasAccess && (
            <View style={styles.crownIcon}>
              <FontAwesome6 name="crown" size={16} color="#FFD700" />
            </View>
          )}
          <View style={styles.themeLeft}>
            <View style={styles.lockIconContainer}>
              <Ionicons
                name={chapterTheme.hasAccess ? "lock-closed" : "lock-open"}
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
                {subjectCode === "NATIONAL_CERTIFICATE"
                  ? chapterTheme.content
                  : `${chapterTheme.ordinalNumber}-mavzu`}
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
            {subjectCode !== "NATIONAL_CERTIFICATE" && (
              <View>
                <Text style={styles.loadingText}>{chapterTheme.percent}%</Text>
              </View>
            )}
          </View>
          {subjectCode === "NATIONAL_CERTIFICATE" && (
            <>
              <Text style={styles.themeCountloadingText}>
                {chapterTheme.percent}%
              </Text>
              <Text style={styles.themeCount}>{chapterTheme.description}</Text>
            </>
          )}
        </TouchableOpacity>
      );
    },
    [
      handleThemePress,
      handleMockTestPress,
      styles,
      subjectCode,
      theme.colors.success,
      theme.colors.textMuted,
    ],
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: subjectName,
      freezeOnBlur: true,
      headerRight: (props: { tintColor?: string }) => (
        <Text style={[styles.headerPercent, { color: props.tintColor }]}>
          {percent}%
        </Text>
      ),
    });
  }, [navigation, percent, styles.headerPercent, subjectName]);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <PageCard>
        {isLoading ? (
          <LoadingData />
        ) : isError ? (
          <ErrorData refetch={refetch} />
        ) : data && data.results.length > 0 ? (
          <SectionList
            sections={sections}
            stickyHeaderHiddenOnScroll
            keyExtractor={keyExtractor}
            renderSectionHeader={renderSectionHeader}
            renderItem={renderItem}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={4}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={Platform.OS === "android"}
            scrollEnabled
            contentContainerStyle={styles.content}
          />
        ) : (
          <EmptyData />
        )}
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
    headerPercent: {
      color: "white",
      fontSize: moderateScale(16),
      fontWeight: "500",
    },
    crownIcon: {
      position: "absolute",
      top: -5,
      right: -5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
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
      fontSize: moderateScale(16),
      color: theme.colors.text,
      fontWeight: "500",
      position: "absolute",
      bottom: 10,
      right: 10,
    },
    themeCountloadingText: {
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
      position: "absolute",
      top: 5,
      right: 5,
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
