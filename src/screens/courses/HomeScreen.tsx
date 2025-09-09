import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleCategoryPress = (categoryName: string) => {
    if (categoryName === "Algebra") {
      (navigation as any).navigate("Algebra");
    } else if (categoryName === "Geometriya") {
      (navigation as any).navigate("Geometriya");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kurslar</Text>
        <TouchableOpacity style={styles.profileBtn}>
          <Ionicons name="chatbox" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {/* Header */}

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>Salom, Farrux!</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategoryPress("Algebra")}
          >
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: "#3b82f6" },
              ]}
            >
              <Ionicons name="add" size={24} color="white" />
            </View>
            <Text style={styles.categoryLabel}>Algebra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => handleCategoryPress("Geometriya")}
          >
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: "#3b82f6" },
              ]}
            >
              <Ionicons name="triangle" size={24} color="white" />
            </View>
            <Text style={styles.categoryLabel}>Geometriya</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: "#3b82f6" },
              ]}
            >
              <Text style={styles.iconText}>A+</Text>
            </View>
            <Text style={styles.categoryLabel}>Milliy Sertifikat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: "#3b82f6" },
              ]}
            >
              <Text style={styles.iconText}>Σ</Text>
            </View>
            <Text style={styles.categoryLabel}>Olimpiadaga kirish</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    padding: 20,
    paddingVertical:20,
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
    color: "#1f2937",
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
    color: "#1f2937",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#3b82f6",
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
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseImage: {
    height: 120,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    marginBottom: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    marginRight: 16,
    color: "#1f2937",
  },
  students: {
    color: "#6b7280",
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
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
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
  },
  iconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  categoryLabel: {
    fontSize: 20,
    flexGrow: 1,
    color: "#1f2937",
    textAlign: "center",
  },
  pointingIcon: {
    position: "absolute",
    top: -5,
    right: -5,
  },
  videoButton: {
    backgroundColor: "#3b82f6",
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
    color: "#3b82f6",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
