import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Theme, SubjectsResponse } from "../../types";
import { useSubjects } from "../../hooks/useSubjects";
import { Skeleton } from "../../components/Skeleton";
import ErrorData from "@/src/components/exceptions/ErrorData";
import EmptyData from "@/src/components/exceptions/EmptyData";
import { numberSpacing } from "@/src/utils";
import Toast from "react-native-toast-message";
import { usePurchase } from "@/src/context/PurchaseContext";

export default function PurchaseSubjectScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: subjects, isLoading, error, refetch } = useSubjects();
  const { selectAll, selectedItems, setSelectAll, setSelectedItems } =
    usePurchase();

  const toggleSubject = useCallback(
    (subject: SubjectsResponse["results"][0]) => {
      setSelectedItems((prev) => {
        const exists = prev.some((item) => item.id === subject.id);
        if (exists) {
          const filtered = prev.filter((item) => item.id !== subject.id);
          if (filtered.length === 0) setSelectAll(false);
          return filtered;
        } else {
          const updated = [...prev, subject];
          if (subjects && updated.length === subjects.results.length)
            setSelectAll(true);
          return updated;
        }
      });
    },
    [subjects]
  );

  const toggleSelectAll = useCallback(() => {
    if (!subjects) return;
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(subjects.results);
      setSelectAll(true);
    }
  }, [selectAll, subjects]);
  const handlePurchase = () => {
    if (selectedItems.length < 1) {
      return Toast.show({
        type: "error",
        text1: "Kurs tanlamadingiz!",
      });
    }
    (navigation as any).navigate("Checkout", { scopeTypeId: 3 });
  };
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(refetch);
    return () => task.cancel();
  }, [refetch]);

  useEffect(() => {
    if (error) {
      console.error(error);
      Alert.alert("Xatolik", "Ma'lumotlarni yuklashda xatolik yuz berdi.");
    }
  }, [error]);

  const totalPrice = useMemo(
    () =>
      numberSpacing(
        selectedItems.reduce((acc, item) => acc + item.price, 0)
      ),
    [selectedItems]
  );

  const getSubjectIcon = useCallback(
    (name: string) => {
      const iconColor = "white";
      switch (name) {
        case "Algebra":
          return <Ionicons name="add" size={24} color={iconColor} />;
        case "Geometriya":
          return <Ionicons name="triangle" size={24} color={iconColor} />;
        case "Milliy Sertifikat":
          return <Text style={styles.iconText}>A+</Text>;
        case "Olimpiadaga kirish":
          return <Text style={styles.iconText}>Σ</Text>;
        default:
          return <Ionicons name="book" size={24} color={iconColor} />;
      }
    },
    [styles.iconText]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Ionicons name="cart-outline" size={38} color="white" />

        <TouchableOpacity onPress={toggleSelectAll}>
          <Text style={styles.headerSelectTotal}>
            Barchasini {"\n"} belgilash
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{totalPrice} UZS</Text>
        </View>

        <View style={styles.section}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={64} radius={12} />
            ))
          ) : error ? (
            <ErrorData refetch={refetch} />
          ) : subjects?.results?.length ? (
            subjects.results.map((subject) => {
              const isSelected = selectedItems.some(
                (s) => s.id === subject.id
              );
              return (
                <TouchableOpacity
                  key={subject.id}
                  style={
                    isSelected
                      ? styles.categoryItemSelected
                      : styles.categoryItem
                  }
                  activeOpacity={0.8}
                  onPress={() => toggleSubject(subject)}
                >
                  <View style={styles.categoryIconContainer}>
                    {getSubjectIcon(subject.name)}
                  </View>
                  <Text
                    style={
                      isSelected
                        ? styles.categoryLabelSelected
                        : styles.categoryLabel
                    }
                  >
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <EmptyData />
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => handlePurchase()}
            activeOpacity={0.8}
          >
            <Text style={styles.videoButtonText}>Sotib olish</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerSelectTotal: {
      fontSize: 13,
      fontWeight: "500",
      color: "white",
    },
    greetingSection: {
      justifyContent: "center",
      alignItems: "center",
      marginVertical: 20,
    },
    greeting: {
      fontSize: 26,
      fontWeight: "500",
      color: theme.colors.text,
    },
    section: {
      paddingHorizontal: 16,
      gap: 14,
      marginBottom: 24,
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    categoryItemSelected: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.primarySecondary,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      padding: 16,
      borderRadius: 12,
      elevation: 2,
    },
    categoryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      marginRight: 12,
    },
    iconText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    categoryLabel: {
      fontSize: 18,
      flex: 1,
      color: theme.colors.text,
      textAlign: "center",
    },
    categoryLabelSelected: {
      fontSize: 18,
      flex: 1,
      color: theme.colors.primary,
      textAlign: "center",
    },
    videoButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
    },
    videoButtonText: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
    },
  });
