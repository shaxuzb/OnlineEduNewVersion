import PageCard from "@/src/components/ui/cards/PageCard";
import { lightColors } from "@/src/constants/theme";
import { useBookmark } from "@/src/context/BookmarkContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemeDetails } from "@/src/hooks/useThemeDetails";
import { BookmarkedLesson, Theme } from "@/src/types";
import { BORDER_RADIUS, FONT_SIZES, SPACING } from "@/src/utils";
import Test from "@/src/assets/icons/themes/test.svg";
import Write from "@/src/assets/icons/themes/write.svg";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EmptyModal from "@/src/components/exceptions/EmptyModal";
import Toast from "react-native-toast-message";
import { moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

export default function LessonDetailScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { themeId, themeName, themeOrdinalNumber, percent } = route.params;
  const {
    addBookmark,
    removeBookmark,
    isBookmarked: isLessonBookmarked,
  } = useBookmark();
  const [emptyModal, setEmptyModal] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({
    open: false,
    title: "",
    description: "",
  });
  // Get lesson data from route params
  const { data, isLoading, isError, refetch } = useThemeDetails(
    Number(themeId)
  );

  // Check if current lesson is bookmarked
  const isBookmarked = isLessonBookmarked(data?.id ?? 0, "algebra");
  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(data?.id ?? 0, "algebra");
        Toast.show({
          type: "success",
          text1: "Dars saqlashdan olib tashlandi!",
        });
      } else {
        if (data) {
          const bookmarkData: BookmarkedLesson = {
            id: data.id,
            title: data.name,
            mavzu: `${data.ordinalNumber}-mavzu`,
            courseType: "algebra" as
              | "algebra"
              | "geometriya"
              | "milliy-sertifikat"
              | "olimpiadaga-kirish",
            courseName: data.subject,
            sectionTitle: `${data.ordinalNumber}-mavzu`,
            duration: "15:30",
            bookmarkedAt: new Date().toISOString(),
          };

          await addBookmark(bookmarkData);
          Toast.show({
            type: "success",
            text1: "Dars muvaffaqiyatli saqlandi!",
          });
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Darsni saqlashda xatolik yuz berdi!",
      });
    }
  };

  const handlePlayVideo = () => {
    // Navigate to video player screen
    if (!data?.video?.fileId) {
      setEmptyModal({
        open: true,
        title: "Video dars mavjud emas",
        description: "Ushbu mavzu uchun video dars hali yuklanmagan.",
      });
    } else {
      navigation.navigate("VideoPlayer", {
        lessonTitle: data?.name,
        videoFileId: data?.video.fileId,
        mavzu: `${data?.ordinalNumber}-mavzu`,
      });
    }
  };
  const handleThemeAbstract = () => {
    // if (data?.testId) {
    navigation.navigate("ThemeAbstract", {
      themeId: data?.id,
      // percent: percent,
      // title: "Mashqlar",
      mavzu: `${data?.ordinalNumber}-mavzu`,
    });
    // } else {
    //   Alert.alert("Warning", "Test biriktirilmagan");
    // }
  };
  const handleMashqlar = () => {
    if (data?.testId) {
      navigation.navigate("QuizScreen", {
        testId: data?.testId,
        percent: percent,
        title: "Mashqlar",
        mavzu: `${data?.ordinalNumber}-mavzu`,
      });
    } else {
      setEmptyModal({
        open: true,
        title: "Testlar hali mavjud emas",
        description: "Bu mavzu bo‘yicha testlar hali joylanmagan.",
      });
    }
  };
  useEffect(() => {
    navigation.setOptions({
      title: themeOrdinalNumber + "-mavzu",
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
  }, [navigation, isBookmarked]);
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>
            Xatolik yuz berdi. Qayta urinib ko'ring.
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Qayta yuklash</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <PageCard>
        <ScrollView style={styles.content}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: SPACING.sm,
            }}
          >
            <Text style={styles.lessonTitle}>{themeName}</Text>
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
                borderless: true,
                radius: 22,
              }}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={handleBookmark}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={moderateScale(24)}
                color="gray"
              />
            </Pressable>
          </View>
          <View style={styles.videoContainer}>
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
              }}
              style={[styles.videoPlayer]}
              onPress={handlePlayVideo}
            >
              <View style={styles.playButtonContainer}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={moderateScale(32)} color="white" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
              }}
              style={styles.actionButton}
              onPress={handleThemeAbstract}
            >
              <View style={styles.actionIconContainer}>
                <Write width={60} height={60} />
              </View>
              <Text style={styles.actionButtonText} numberOfLines={2}>
                Mavzu konspekt
              </Text>
            </Pressable>
            <Pressable
              android_ripple={{
                foreground: true,
                color: lightColors.ripple,
              }}
              style={styles.actionButton}
              onPress={handleMashqlar}
            >
              <View style={styles.actionIconContainer}>
                <Test width={60} height={60} />
              </View>
              <Text style={styles.actionButtonText} numberOfLines={2}>
                IDS mavzulashtirilgan testlar to'plami
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </PageCard>
      <EmptyModal
        visible={emptyModal.open}
        onBack={() =>
          setEmptyModal({ open: false, title: "", description: "" })
        }
        title={emptyModal.title}
        description={emptyModal.description}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.base,
    },
    headerButton: {
      padding: SPACING.xs,
    },
    headerTitle: {
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
    },
    lessonTitle: {
      fontSize: moderateScale(FONT_SIZES.xl),
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      flexWrap: "wrap",
      flexShrink: 1,
      flexGrow: 1,
    },
    videoContainer: {
      marginBottom: SPACING["2xl"],
    },
    videoPlayer: {
      width: "100%",
      height: width * 0.56, // 16:9 aspect ratio
      backgroundColor: "#000",
      overflow: "hidden",
      borderRadius: BORDER_RADIUS.base,
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    playButtonContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    playButton: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    handPointer: {
      position: "absolute",
      top: -10,
      right: -30,
    },
    actionButtons: {
      gap: SPACING.base,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      padding: SPACING.lg,
      overflow: "hidden",
      borderRadius: BORDER_RADIUS.base,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    actionIconContainer: {
      marginRight: SPACING.base,
    },
    actionButtonText: {
      fontSize: moderateScale(FONT_SIZES.lg),
      color: theme.colors.text,
      fontWeight: "500",
      flexShrink: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
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
  });
