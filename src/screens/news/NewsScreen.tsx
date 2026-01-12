import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NewsItem, Theme } from "../../types";
import { useNews } from "@/src/hooks/useNews";
import { useTheme } from "../../context/ThemeContext";
import { lightColors } from "@/src/constants/theme";
import { moderateScale } from "react-native-size-matters";

export default function NewsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const { data, isLoading, isFetching, refetch, error } = useNews();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Hozirgina";
    } else if (diffInHours < 24) {
      return `${diffInHours} soat oldin`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return "Kecha";
      } else if (diffInDays < 7) {
        return `${diffInDays} kun oldin`;
      } else {
        return date.toLocaleDateString("uz-UZ");
      }
    }
  };

  const getNewsTypeIcon = (newsType: number) => {
    switch (newsType) {
      case 1:
        return "warning";
      case 2:
        return "information-circle";
      case 3:
        return "newspaper";
      default:
        return "newspaper";
    }
  };

  const getNewsTypeColor = (newsType: number) => {
    switch (newsType) {
      case 1:
        return theme.colors.warning;
      case 2:
        return theme.colors.primary;
      case 3:
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  const renderNewsItem = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.newsItem,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.newsHeader}>
        <View style={styles.newsHeaderLeft}>
          <View
            style={[
              styles.newsTypeIcon,
              { backgroundColor: getNewsTypeColor(item.newsType) + "20" },
            ]}
          >
            <Ionicons
              name={getNewsTypeIcon(item.newsType)}
              size={moderateScale(16)}
              color={getNewsTypeColor(item.newsType)}
            />
          </View>
          <View style={styles.newsTitleContainer}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.newsTitle, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.isPinned && (
                <Ionicons
                  name="pin"
                  size={moderateScale(14)}
                  color={theme.colors.primary}
                  style={styles.pinIcon}
                />
              )}
            </View>
            <Text style={[styles.newsDate, { color: theme.colors.textMuted }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        {!item.isPublished && (
          <View style={[styles.statusBadge, styles.draftBadge]}>
            <Text style={styles.statusBadgeText}>Draft</Text>
          </View>
        )}
      </View>

      <Text
        style={[styles.newsBody, { color: theme.colors.textSecondary }]}
        numberOfLines={3}
      >
        {item.body}
      </Text>
    </TouchableOpacity>
  );
  useEffect(() => {
    navigation.setOptions({
      title: "Yangiliklar",
      freezeOnBlur: true,
      headerRight: () => (
        <Pressable
          android_ripple={{
            foreground: true,
            color: lightColors.ripple,
            borderless: true,
            radius: moderateScale(30),
          }}
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => refetch()}
        >
          <Ionicons name="reload" size={moderateScale(18)} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            Yangiliklar yuklanmoqda...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={moderateScale(56)} color={theme.colors.error} />
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Xatolik yuz berdi
          </Text>
          <Text
            style={[styles.errorMessage, { color: theme.colors.textSecondary }]}
          >
            {error.message}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isFetching}
            onRefresh={() => refetch()}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {data?.items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="newspaper-outline"
              size={moderateScale(56)}
              color={theme.colors.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Yangiliklar yo'q
            </Text>
            <Text
              style={[
                styles.emptyMessage,
                { color: theme.colors.textSecondary },
              ]}
            >
              Hozircha yangiliklar mavjud emas. Keyinroq qaytib ko'ring.
            </Text>
          </View>
        ) : (
          <>
            {data?.items.map(renderNewsItem)}
            {data?.items.map(renderNewsItem)}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: moderateScale(14),
      paddingTop: moderateScale(14),
    },
    newsItem: {
      padding: moderateScale(14),
      marginBottom: moderateScale(6),
      borderRadius: moderateScale(10),
      borderWidth: 1,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    newsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: moderateScale(6),
    },
    newsHeaderLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
    },
    newsTypeIcon: {
      width: moderateScale(30),
      height: moderateScale(30),
      borderRadius: moderateScale(8),
      justifyContent: "center",
      alignItems: "center",
      marginRight: moderateScale(8),
    },
    newsTitleContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    newsTitle: {
      fontSize: moderateScale(15),
      fontWeight: "600",
      flex: 1,
    },
    pinIcon: {
      marginLeft: moderateScale(4),
    },
    newsDate: {
      fontSize: moderateScale(10),
    },
    statusBadge: {
      paddingHorizontal: moderateScale(8),
      paddingVertical: moderateScale(4),
      borderRadius: moderateScale(6),
    },
    draftBadge: {
      backgroundColor: theme.colors.warning + "20",
    },
    statusBadgeText: {
      fontSize: moderateScale(10),
      fontWeight: "500",
      color: theme.colors.warning,
    },
    newsBody: {
      fontSize: moderateScale(14),
      lineHeight: moderateScale(20),
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 8,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "white",
      fontSize: moderateScale(14),
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: moderateScale(22),
      fontWeight: "bold",
      marginTop: moderateScale(16),
      marginBottom: moderateScale(8),
    },
    emptyMessage: {
      fontSize: moderateScale(14),
      textAlign: "center",
      paddingHorizontal: moderateScale(24),
    },
    bottomSpacing: {
      height: 24,
    },
  });
