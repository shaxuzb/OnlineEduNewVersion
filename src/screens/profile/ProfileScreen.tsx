import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Theme } from "../../types";

const menuItems = [
  {
    id: 1,
    title: "Shaxsiy ma'lumotlar",
    icon: "person-outline",
    hasArrow: true,
  },
  {
    id: 2,
    title: "Xavfsizlik",
    icon: "shield-outline",
    hasArrow: true,
  },
  {
    id: 3,
    title: "Tungi rejim",
    icon: "moon-outline",
    hasToggle: true,
  },
  {
    id: 4,
    title: "A'loqa",
    icon: "mail-outline",
    hasArrow: true,
  },
  {
    id: 5,
    title: "Dastur haqida",
    icon: "information-circle-outline",
    hasArrow: true,
  },
  {
    id: 6,
    title: "Kurs to'lovlari",
    icon: "card-outline",
    hasArrow: true,
  },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const styles = createStyles(theme);

  const handleLogout = () => {
    Alert.alert("Chiqish", "Rostdan ham tizimdan chiqmoqchimisiz?", [
      {
        text: "Bekor qilish",
        style: "cancel",
      },
      {
        text: "Chiqish",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const handleMenuItemPress = (item: (typeof menuItems)[0]) => {
    if (item.id === 1) {
      // Shaxsiy ma'lumotlar
      (navigation as any).navigate("PersonalInfo");
    } else if (item.id === 2) {
      // Xavfsizlik
      Alert.alert("Ma'lumot", "Xavfsizlik bo'limi hali tayyor emas");
    } else if (item.id === 4) {
      // A'loqa
      Alert.alert("Ma'lumot", "A'loqa bo'limi hali tayyor emas");
    } else if (item.id === 5) {
      // Dastur haqida
      Alert.alert("Ma'lumot", "Dastur haqida bo'limi hali tayyor emas");
    } else if (item.id === 6) {
      // Kurs to'lovlari
      Alert.alert("Ma'lumot", "Kurs to'lovlari bo'limi hali tayyor emas");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity>
          <Ionicons name="chatbox-ellipses-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
                }}
                style={styles.avatar}
              />
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.fullName || user?.userName || "Foydalanuvchi"}
          </Text>
          <Text style={styles.userEmail}>{user?.userName}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuItemPress(item)}
              disabled={item.hasToggle}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={theme.colors.primary}
                  style={styles.menuItemIcon}
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              {item.hasToggle ? (
                <Switch
                  value={themeMode === "dark"}
                  onValueChange={(e) => {
                    if (e) {
                      setThemeMode("dark");
                    } else {
                      setThemeMode("light");
                    }
                  }}
                  trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primary,
                  }}
                  thumbColor={themeMode === "dark" ? "#ffffff" : "#f4f3f4"}
                />
              ) : (
                item.hasArrow && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                )
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={theme.colors.error}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Tizimdan chiqish</Text>
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
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    profileSection: {
      backgroundColor: theme.colors.card,
      paddingVertical: 32,
      alignItems: "center",
      marginBottom: 1,
    },
    profileHeader: {
      alignItems: "center",
      marginBottom: 16,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryDark,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    userName: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.colors.text,
      textAlign: "center",
    },
    menuContainer: {
      backgroundColor: theme.colors.card,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemIcon: {
      marginRight: 12,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 4,
      textAlign: "center",
    },
    logoutContainer: {
      backgroundColor: theme.colors.card,
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    logoutIcon: {
      marginRight: 8,
    },
    logoutText: {
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: "500",
    },
  });
