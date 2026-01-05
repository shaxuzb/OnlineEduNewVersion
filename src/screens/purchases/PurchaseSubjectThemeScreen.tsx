import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { usePurchase } from "@/src/context/PurchaseContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useThemes } from "@/src/hooks/useThemes";
import { ChapterTheme, Theme } from "@/src/types";
import { COLORS, numberSpacing } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PurchaseSubjectThemeScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { selectedItems, setSelectAll, setSelectedItems } = usePurchase();
  const { subjectId } = route.params;
  const { data, isLoading, isError, refetch } = useThemes(Number(subjectId));

  // 🧩 Flatten all themes
  const allThemes = useMemo(
    () => data?.results.flatMap((chapter) => chapter.themes) || [],
    [data]
  );

  // 🔘 Toggle single theme
  const toggleTheme = useCallback(
    (theme: ChapterTheme) => {
      setSelectedItems((prev) => {
        const exists = prev.some((item) => item.id === theme.id);
        const updated = exists
          ? prev.filter((item) => item.id !== theme.id)
          : [...prev, theme];
        setSelectAll(updated.length === allThemes.length);
        return updated;
      });
    },
    [allThemes.length]
  );

  // ✅ Toggle all themes
  const toggleSelectAll = useCallback(() => {
    if (!allThemes.length) return;
    setSelectAll((prev) => {
      const newSelect = !prev;
      setSelectedItems(newSelect ? allThemes : []);
      return newSelect;
    });
  }, [allThemes]);
  const handlePurchase = () => {
    if (selectedItems.length < 1) {
      return Toast.show({
        type: "error",
        text1: "Mavzu tanlamadingiz!",
      });
    }
    navigation.navigate("Checkout", { scopeTypeId: 1 });
  };
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(refetch);
    return () => task.cancel();
  }, [refetch]);
  const totalPrice = useMemo(
    () => numberSpacing(selectedItems.reduce((acc, t) => acc + t.price, 0)),
    [selectedItems]
  );
  const renderChapter = useCallback(
    (chapter: any) => (
      <View key={chapter.id}>
        <Text style={styles.chapterSectionTitle}>
          {chapter.ordinalNumber}-bob. {chapter.name}
        </Text>
        {chapter.themes.map((theme: ChapterTheme) => {
          const isSelected = selectedItems.some((t) => t.id === theme.id);
          return (
            <TouchableOpacity
              key={theme.id}
              style={[
                { overflow: "hidden" },
                isSelected ? styles.themeCardSelected : styles.themeCard,
              ]}
              onPress={() => toggleTheme(theme)}
              disabled={theme.hasAccess}
              activeOpacity={0.8}
            >
              <View style={styles.themeInfo}>
                <Text style={styles.themeNumber}>
                  {theme.ordinalNumber}-mavzu
                </Text>
                <Text
                  style={styles.themeName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {theme.name}
                </Text>
              </View>
              {theme.hasAccess && (
                <Text
                  style={{
                    position: "absolute",
                    right: 0,
                    backgroundColor: COLORS.primary,
                    color: "white",
                    padding: 2,
                    paddingHorizontal: 9,
                    borderBottomLeftRadius: 8,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  Sotib olingan
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    ),
    [selectedItems, styles, toggleTheme]
  );
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Ionicons name="cart-outline" size={38} color="white" />
      ),
      freezeOnBlur: true,
      headerRight: () => (
        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.headerSelectTotal}>
            Barchasini {"\n"} belgilash
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, toggleSelectAll]);
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Total Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.priceText}>{totalPrice} UZS</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingData />
      ) : isError ? (
        <ErrorData refetch={refetch} />
      ) : data?.results.length ? (
        <ScrollView style={styles.content}>
          {data.results.map(renderChapter)}
        </ScrollView>
      ) : (
        <Text style={styles.notFound}>Topilmadi</Text>
      )}

      {/* Purchase Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.8}
          onPress={() => handlePurchase()}
        >
          <Text style={styles.buyButtonText}>Sotib olish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerSelectTotal: {
      fontSize: 13,
      fontWeight: "500",
      color: "white",
      textAlign: "center",
    },

    priceContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
    },
    priceText: {
      fontSize: 26,
      fontWeight: "600",
      color: theme.colors.text,
    },

    content: { flex: 1, paddingHorizontal: 16 },

    themeCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    themeCardSelected: {
      backgroundColor: theme.colors.primarySecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },

    themeInfo: { flex: 1 },
    themeNumber: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    themeName: { fontSize: 16, color: theme.colors.text, lineHeight: 20 },

    chapterSectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 12,
      marginTop: 8,
    },

    notFound: {
      textAlign: "center",
      color: theme.colors.textMuted,
      fontSize: 16,
      marginTop: 40,
    },

    footer: {
      paddingHorizontal: 16,
      marginVertical: 16,
    },
    buyButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    buyButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
  });
