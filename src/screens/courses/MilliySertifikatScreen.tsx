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
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";

interface TestItem {
  id: number;
  title: string;
  isLocked: boolean;
}

export default function MilliySertifikatScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const tests: TestItem[] = [
    { id: 1, title: "1-Test", isLocked: false },
    { id: 2, title: "2-Test", isLocked: true },
    { id: 3, title: "3-Test", isLocked: true },
    { id: 4, title: "4-Test", isLocked: true },
    { id: 5, title: "5-Test", isLocked: true },
    { id: 6, title: "6-Test", isLocked: true },
    { id: 7, title: "7-Test", isLocked: true },
    { id: 8, title: "8-Test", isLocked: true },
    { id: 9, title: "9-Test", isLocked: true },
  ];

  const handleTestPress = (test: TestItem) => {
    if (!test.isLocked) {
      // Navigate to test or handle test access
      console.log(`Opening ${test.title}`);
      // You can add navigation logic here for when tests are unlocked
    } else {
      // Show locked message or unlock logic
      console.log(`${test.title} is locked`);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milliy Sertifikat</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.testsContainer}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[
                styles.testItem,
                test.isLocked && styles.testItemLocked,
              ]}
              onPress={() => handleTestPress(test)}
              activeOpacity={test.isLocked ? 1 : 0.7}
            >
              <View style={styles.testContent}>
                <View style={styles.lockIconContainer}>
                  <Ionicons
                    name={test.isLocked ? "lock-closed" : "lock-open"}
                    size={20}
                    color={test.isLocked ? theme.colors.textMuted : theme.colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.testTitle,
                    test.isLocked && styles.testTitleLocked,
                  ]}
                >
                  {test.title}
                </Text>
                {!test.isLocked && (
                  <View style={styles.pointingHand}>
                    <Text style={styles.pointingHandEmoji}>👉</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
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
    paddingTop: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  testsContainer: {
    gap: 12,
  },
  testItem: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testItemLocked: {
    opacity: 0.6,
  },
  testContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lockIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  testTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    flex: 1,
    textAlign: "center",
  },
  testTitleLocked: {
    color: theme.colors.textMuted,
  },
  pointingHand: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  pointingHandEmoji: {
    fontSize: 18,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bottomNavItem: {
    padding: 8,
  },
});
