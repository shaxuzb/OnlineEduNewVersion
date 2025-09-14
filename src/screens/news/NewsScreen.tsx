import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NewsItem, NewsResponse } from "../../types";
import NewsService from "../../services/newsService";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../../utils";

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const theme = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // For now, using mock data. Replace with NewsService.fetchNews() when API is ready
      const response: NewsResponse = await NewsService.fetchNewsMock();

      // Sort news: pinned items first, then by creation date (newest first)
      const sortedNews = response.items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setNews(sortedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Yangiliklar yuklanmadi. Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

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
        return COLORS.warning;
      case 2:
        return COLORS.primary;
      case 3:
        return COLORS.success;
      default:
        return COLORS.primary;
    }
  };

  const renderNewsItem = (item: NewsItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.newsItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
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
                style={[styles.newsTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.isPinned && (
                <Ionicons
                  name="pin"
                  size={14}
                  color={COLORS.primary}
                  style={styles.pinIcon}
                />
              )}
            </View>
            <Text style={[styles.newsDate, { color: theme.textMuted }]}>
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
        style={[styles.newsBody, { color: theme.textSecondary }]}
        numberOfLines={3}
      >
        {item.body}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Yangiliklar yuklanmoqda...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Xatolik yuz berdi
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchNews()}
          >
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Yangiliklar
        </Text>
        <TouchableOpacity
          onPress={() => fetchNews()}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchNews(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {news.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="newspaper-outline"
              size={64}
              color={theme.textMuted}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Yangiliklar yo'q
            </Text>
            <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
              Hozircha yangiliklar mavjud emas. Keyinroq qaytib ko'ring.
            </Text>
          </View>
        ) : (
          <>
            {news.map(renderNewsItem)}
            <View style={styles.bottomSpacing} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "bold",
  },
  refreshButton: {
    padding: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
  },
  newsItem: {
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.base,
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
    marginBottom: SPACING.sm,
  },
  newsHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  newsTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
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
    fontSize: FONT_SIZES.lg,
    fontWeight: "600",
    flex: 1,
  },
  pinIcon: {
    marginLeft: SPACING.xs,
  },
  newsDate: {
    fontSize: FONT_SIZES.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  draftBadge: {
    backgroundColor: COLORS.warning + "20",
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "500",
    color: COLORS.warning,
  },
  newsBody: {
    fontSize: FONT_SIZES.base,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "bold",
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: FONT_SIZES.base,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING["3xl"],
  },
  emptyTitle: {
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "bold",
    marginTop: SPACING.base,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.base,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});
