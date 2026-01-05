import EmptyData from "@/src/components/exceptions/EmptyData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import Skeleton from "@/src/components/Skeleton";
import { usePurchase } from "@/src/context/PurchaseContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useSubjects } from "@/src/hooks/useSubjects";
import { SubjectsResponse, Theme } from "@/src/types";
import { numberSpacing } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo } from "react";
import {
  Alert,
  Image,
  InteractionManager,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function PurchaseSubjectScreen({
  navigation,
}: {
  navigation: any;
}) {
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
    navigation.navigate("Checkout", { scopeTypeId: 3 });
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
      numberSpacing(selectedItems.reduce((acc, item) => acc + item.price, 0)),
    [selectedItems]
  );

  const getSubjectIcon = useCallback(
      (name: string) => {
        switch (name) {
          case "Algebra":
            return (
              <Image
                resizeMode="contain"
                style={{ flex: 1, resizeMode: "contain" }}
                source={require("@/src/assets/icons/subjects/algebra.png")}
              />
            );
          case "Geometriya":
            return (
              <Image
                resizeMode="contain"
                style={{ flex: 1, resizeMode: "contain" }}
                source={require("@/src/assets/icons/subjects/geometry.png")}
              />
            );
          case "Milliy Sertifikat":
            return (
              <Image
                resizeMode="contain"
                style={{ flex: 1, resizeMode: "contain" }}
                source={require("@/src/assets/icons/subjects/milliysertificat.png")}
              />
            );
          case "Maktab Dasturi":
            return (
              <Image
                resizeMode="contain"
                style={{ flex: 1, resizeMode: "contain" }}
                source={require("@/src/assets/icons/subjects/bolalar.png")}
              />
            );
          default:
            return (
              <Image
                resizeMode="contain"
                style={{ flex: 1, resizeMode: "contain" }}
                source={require("@/src/assets/icons/subjects/bolalar.png")}
              />
            );
        }
      },
      [styles.iconText]
    );
  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Ionicons name="cart-outline" size={38} color="white" />
      ),
      headerTintColor: "white",
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
    <SafeAreaView style={styles.container} edges={[]}>
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
              const isSelected = selectedItems.some((s) => s.id === subject.id);
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
      padding: 10,
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
