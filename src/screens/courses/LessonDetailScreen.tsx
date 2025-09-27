import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { SPACING, FONT_SIZES, BORDER_RADIUS } from "../../utils";
import { useBookmark } from "../../context/BookmarkContext";
import { BookmarkedLesson, RootStackParamList, Theme } from "../../types";
import { useThemeDetails } from "@/src/hooks/useThemeDetails";

const { width } = Dimensions.get("window");

export default function LessonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { themeId, themeName, themeOrdinalNumber } =
    route.params as RootStackParamList["LessonDetail"];
  const {
    addBookmark,
    removeBookmark,
    isBookmarked: isLessonBookmarked,
  } = useBookmark();

  // Get lesson data from route params
  const { data, isLoading, isError, refetch } = useThemeDetails(themeId);

  // Check if current lesson is bookmarked
  const isBookmarked = isLessonBookmarked(data?.id ?? 0, "algebra");

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        await removeBookmark(data?.id ?? 0, "algebra");
        Alert.alert("Saqlash", "Dars saqlashdan olib tashlandi!");
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
          Alert.alert("Saqlash", "Dars muvaffaqiyatli saqlandi!");
        }
      }
    } catch (error) {
      Alert.alert("Xatolik", "Darsni saqlashda xatolik yuz berdi!");
    }
  };

  const handlePlayVideo = () => {
    // Navigate to video player screen
    if (!data?.video?.fileId) {
      Alert.alert("Warning", "Video yuklanmagan");
    } else {
      (navigation as any).navigate("VideoPlayer", {
        lessonTitle: data?.name,
        videoFileId: data?.video.fileId,
        mavzu: `${data?.ordinalNumber}-mavzu`,
      });
    }
  };

  const handleMashqlar = () => {
    if (data?.testId) {
      (navigation as any).navigate("QuizScreen", {
        testId: data?.testId,
        title: "Mashqlar",
        mavzu: `${data?.ordinalNumber}-mavzu`,
      });
    } else {
      Alert.alert("Warning", "Test biriktirilmagan");
    }
  };

  const handleOralQuestions = () => {
    console.log("Open oral questions");
    // Navigate to oral questions screen
  };
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{themeOrdinalNumber}-mavzu</Text>

          <TouchableOpacity
            onPress={handleBookmark}
            style={styles.headerButton}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
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
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{themeOrdinalNumber}-mavzu</Text>

          <TouchableOpacity
            onPress={handleBookmark}
            style={styles.headerButton}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{themeOrdinalNumber}-mavzu</Text>

        <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Lesson Title */}
        <Text style={styles.lessonTitle}>{themeName}</Text>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <TouchableOpacity
            style={[styles.videoPlayer]}
            onPress={handlePlayVideo}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMashqlar}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons
                name="add-circle"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.actionButtonText}>Mashqlar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOralQuestions}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons
                name="play-circle"
                size={24}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.actionButtonText}>Og'zaki savol-javob</Text>
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
      fontSize: FONT_SIZES.xl,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: SPACING["2xl"],
      lineHeight: 28,
    },
    videoContainer: {
      marginBottom: SPACING["2xl"],
    },
    videoPlayer: {
      width: "100%",
      height: width * 0.56, // 16:9 aspect ratio
      backgroundColor: "#000",
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
      width: 80,
      height: 80,
      borderRadius: 40,
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
      fontSize: FONT_SIZES.lg,
      color: theme.colors.text,
      fontWeight: "500",
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
