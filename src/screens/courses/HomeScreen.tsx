import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/ThemeContext";
import { Theme, Subject } from "../../types";
import { useSubjects } from "../../hooks/useSubjects";
import { Skeleton } from "../../components/Skeleton";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Fetch subjects data using React Query
  const { data: subjects, isLoading, error, refetch } = useSubjects();

  const handleSubjectPress = (subject: Subject) => {
    // Navigate to SubjectScreen with subject data
    (navigation as any).navigate("SubjectScreen", {
      subjectId: subject.id,
      subjectName: subject.name,
    });
  };

  // Legacy handler for hardcoded navigation (can be removed later)
  const handleCategoryPress = (categoryName: string) => {
    if (categoryName === "Algebra") {
      (navigation as any).navigate("Algebra");
    } else if (categoryName === "Geometriya") {
      (navigation as any).navigate("Geometriya");
    } else if (categoryName === "Milliy Sertifikat") {
      (navigation as any).navigate("MilliySertifikat");
    }
  };

  // Show error if API call fails
  if (error) {
    console.log(error);

    Alert.alert("Xatolik", "Ma'lumotlarni yuklashda xatolik yuz berdi.");
  }

  // Get icon for subject
  const getSubjectIcon = (name: string) => {
    switch (name) {
      case "Algebra":
        return <Ionicons name="add" size={24} color="white" />;
      case "Geometriya":
        return <Ionicons name="triangle" size={24} color="white" />;
      case "Milliy Sertifikat":
        return <Text style={styles.iconText}>A+</Text>;
      case "Olimpiadaga kirish":
        return <Text style={styles.iconText}>Σ</Text>;
      default:
        return <Ionicons name="book" size={24} color="white" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kurslar</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => (navigation as any).navigate("Chat")}
        >
          <Ionicons name="chatbox" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* Header */}

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting} onPress={() => refetch()}>
            Salom, Farrux!
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          {isLoading ? (
            <>
              <Skeleton height={64} radius={12} />
              <Skeleton height={64} radius={12} />
              <Skeleton height={64} radius={12} />
              <Skeleton height={64} radius={12} />
            </>
          ) : (
            subjects?.results?.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.categoryItem}
                onPress={() => handleSubjectPress(s)}
              >
                <View style={styles.categoryIconContainer}>
                  {getSubjectIcon(s.name)}
                </View>
                <Text style={styles.categoryLabel}>{s.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Video Lessons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.videoButton}>
            <View style={styles.videoIconContainer}>
              <Ionicons name="play" size={24} color="white" />
            </View>
            <Text style={styles.videoButtonText}>Video qo'llanma</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.linkButton}>
        <Text style={styles.linkText}>Kurslarni sotib olish</Text>
      </TouchableOpacity>
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
      padding: 20,
      paddingVertical: 20,
      paddingTop: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: "white",
    },
    profileBtn: {
      borderRadius: 50,
    },
    greetingSection: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    greeting: {
      fontSize: 36,
      fontWeight: "bold",
      color: theme.colors.text,
    },
    section: {
      paddingHorizontal: 16,
      gap: 14,
      marginTop: 24,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    seeAllText: {
      color: theme.colors.primary,
      fontWeight: "500",
    },
    categoriesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    categoryCard: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginHorizontal: 4,
    },
    categoryText: {
      color: "white",
      fontSize: 14,
      fontWeight: "500",
      marginTop: 8,
    },
    courseCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    courseImage: {
      height: 120,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      marginBottom: 12,
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 4,
    },
    courseInstructor: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    courseStats: {
      flexDirection: "row",
      alignItems: "center",
    },
    rating: {
      marginLeft: 4,
      marginRight: 16,
      color: theme.colors.text,
    },
    students: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    categoriesGrid: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 16,
    },
    categoryItem: {
      alignItems: "center",
      position: "relative",
      flexDirection: "row",
      flex: 1,
      backgroundColor: theme.colors.card,
      padding: 16,
      borderRadius: 12,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    categoryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
    },
    iconText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
    categoryLabel: {
      fontSize: 20,
      flexGrow: 1,
      color: theme.colors.text,
      textAlign: "center",
    },
    pointingIcon: {
      position: "absolute",
      top: -5,
      right: -5,
    },
    videoButton: {
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    videoIconContainer: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      padding: 8,
      borderRadius: 50,
      marginRight: 12,
    },
    videoButtonText: {
      color: "white",
      textAlign: "center",
      flexGrow: 1,
      fontSize: 20,
      fontWeight: "600",
    },
    linkButton: {
      alignItems: "center",
      paddingVertical: 10,
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 16,
      textDecorationLine: "underline",
    },
  });
