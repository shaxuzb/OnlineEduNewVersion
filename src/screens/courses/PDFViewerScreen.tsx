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
import Pdf from "react-native-pdf";
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from "../../utils";
const { width, height } = Dimensions.get("window");

export default function PDFViewerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get PDF data from route params
  const { pdfPath, title, mavzu } = (route.params as any) || {};

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setLoading(false);
  };

  const handlePageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const handleError = (error: any) => {
    setLoading(false);
    Alert.alert(
      "Xatolik",
      "PDF faylni ochishda xatolik yuz berdi. Fayl mavjudligini tekshiring.",
      [{ text: "OK", onPress: handleGoBack }]
    );
    console.error("PDF Error:", error);
  };

  const source = pdfPath ? { uri: "pdfsf" } : undefined;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{mavzu || "Mashqlar"}</Text>
          <Text style={styles.headerSubtitle}>Mashqlar</Text>
        </View>

        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            {totalPages > 0 ? `${currentPage}/${totalPages}` : "--"}
          </Text>
        </View>
      </View>

      {/* PDF Content */}
      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>PDF yuklanmoqda...</Text>
          </View>
        )}

        {source ? (
          <Pdf
            source={source}
            onLoadComplete={handleLoadComplete}
            onPageChanged={handlePageChanged}
            onError={handleError}
            style={styles.pdf}
            trustAllCerts={false}
            enablePaging={true}
            horizontal={false}
            spacing={10}
            password=""
            scale={1.0}
            minScale={1.0}
            maxScale={3.0}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color={COLORS.primary} />
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.gray} />
            <Text style={styles.errorTitle}>PDF topilmadi</Text>
            <Text style={styles.errorText}>
              Fayl manzili: {pdfPath || "Belgilanmagan"}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleGoBack}>
              <Text style={styles.retryButtonText}>Orqaga qaytish</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    minHeight: 60,
  },
  headerButton: {
    padding: SPACING.xs,
    minWidth: 40,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: SPACING.base,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "bold",
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  pageIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 60,
    alignItems: "center",
  },
  pageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
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
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  errorText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray,
    textAlign: "center",
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.base,
  },
  retryButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.white,
    fontWeight: "500",
  },
});
