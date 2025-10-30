import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NewsItem, Theme } from "../../types";
import { useNews } from "@/src/hooks/useNews";
import { useTheme } from "../../context/ThemeContext";
import useDoubleBackExit from "@/src/hooks/useDoubleBackExit";

export default function NewsScreen() {
  useDoubleBackExit();
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
              size={16}
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
                  size={14}
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
          <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
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
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.background,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Yangiliklar
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

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
              size={64}
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
    },
    refreshButton: {
      padding: 4,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    newsItem: {
      padding: 16,
      marginBottom: 8,
      borderRadius: 12,
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
      marginBottom: 8,
    },
    newsHeaderLeft: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
    },
    newsTypeIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
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
      fontSize: 18,
      fontWeight: "600",
      flex: 1,
    },
    pinIcon: {
      marginLeft: 4,
    },
    newsDate: {
      fontSize: 14,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    draftBadge: {
      backgroundColor: theme.colors.warning + "20",
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.warning,
    },
    newsBody: {
      fontSize: 16,
      lineHeight: 22,
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
      fontSize: 16,
      fontWeight: "600",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 16,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 16,
      textAlign: "center",
      paddingHorizontal: 24,
    },
    bottomSpacing: {
      height: 24,
    },
  });
