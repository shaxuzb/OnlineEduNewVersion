import { alertService } from "@/src/components/modals/customalert/alertService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useGeo } from "@/src/hooks/useGeo";
import { useSession } from "@/src/hooks/useSession";
import { Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { memo, useEffect } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

const menuItems = [
  {
    id: 1,
    title: "Shaxsiy ma'lumotlar",
    icon: "person-outline",
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
  // {
  //   id: 5,
  //   title: "Dastur haqida",
  //   icon: "information-circle-outline",
  //   hasArrow: true,
  // },
  {
    id: 6,
    title: "Kurs to'lovlari",
    icon: "card-outline",
    hasArrow: true,
  },
];

function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(theme);
  const { isSuperAdmin } = useSession();
  const { countryCode } = useGeo();
  const handleLogout = () => {
    alertService.open({
      title: "Chiqish",
      description: "Rostdan ham tizimdan chiqmoqchimisiz?",
      okText: "Chiqish",
      onOk: logout,
    });
    // Alert.alert("Chiqish", "Rostdan ham tizimdan chiqmoqchimisiz?", [
    //   {
    //     text: "Bekor qilish",
    //     style: "cancel",
    //   },
    //   {
    //     text: "Chiqish",
    //     style: "destructive",
    //     onPress: logout,
    //   },
    // ]);
  };
  const handleLinkToAdmin = async () => {
    await Linking.openURL("https://t.me/richdev_1");
  };
  const handleMenuItemPress = (item: (typeof menuItems)[0]) => {
    if (item.id === 1) {
      // Shaxsiy ma'lumotlar
      (navigation as any).navigate("PersonalInfo");
    } else if (item.id === 4) {
      // A'loqa
      handleLinkToAdmin();
    } else if (item.id === 5) {
      // Dastur haqida
      Alert.alert("Ma'lumot", "Dastur haqida bo'limi hali tayyor emas");
    } else if (item.id === 6) {
      // Kurs to'lovlari
      (navigation as any).navigate("PaymentOrders");
    }
  };
  useEffect(() => {
    navigation.setOptions({
      title: "Profil",
      headerRight: () => (
        <Pressable
          android_ripple={{
            foreground: true,
            color: theme.colors.ripple,
            borderless: true,
            radius: moderateScale(22),
          }}
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            alignItems: "center",
            justifyContent: "center",
            marginRight: moderateScale(10),
          }}
          onPress={() => (navigation as any).navigate("Chat")}
        >
          <Ionicons
            name="chatbox-ellipses-outline"
            size={moderateScale(20)}
            color="white"
          />
        </Pressable>
      ),
    });
  }, [navigation]);
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Header */}
      {/* Header */}
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
          {menuItems
            .filter(
              (item) => !(item.id === 6 && isSuperAdmin && countryCode !== "UZ")
            )
            .map((item, index) => {
              return (
                <Pressable
                  key={item.id}
                  android_ripple={{
                    foreground: true,
                    color: theme.colors.ripple,
                  }}
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
                      size={moderateScale(20)}
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
                        size={moderateScale(20)}
                        color={theme.colors.textMuted}
                      />
                    )
                  )}
                </Pressable>
              );
            })}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable
            android_ripple={{
              foreground: true,
              color: theme.colors.ripple,
            }}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={moderateScale(20)}
              color={theme.colors.error}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Tizimdan chiqish</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
export default memo(ProfileScreen);
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(16),
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    content: {
      flex: 1,
    },
    profileSection: {
      backgroundColor: theme.colors.card,
      paddingVertical: moderateScale(32),
      alignItems: "center",
      marginBottom: 1,
    },
    profileHeader: {
      alignItems: "center",
      marginBottom: moderateScale(16),
    },
    avatarContainer: {
      width: moderateScale(100),
      height: moderateScale(100),
      borderRadius: moderateScale(50),
      backgroundColor: theme.colors.primaryDark,
      justifyContent: "center",
      alignItems: "center",
    },
    avatar: {
      width: moderateScale(80),
      height: moderateScale(80),
      borderRadius: moderateScale(40),
    },
    userName: {
      fontSize: moderateScale(20),
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
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(14),
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    menuItemIcon: {
      marginRight: moderateScale(12),
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuItemText: {
      fontSize: moderateScale(14),
      color: theme.colors.text,
      fontWeight: "500",
    },
    userEmail: {
      fontSize: moderateScale(14),
      color: theme.colors.textSecondary,
      marginTop: moderateScale(4),
      textAlign: "center",
    },
    logoutContainer: {
      backgroundColor: theme.colors.card,
      marginTop: moderateScale(20),
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: moderateScale(20),
      paddingVertical: moderateScale(22),
    },
    logoutIcon: {
      marginRight: moderateScale(8),
    },
    logoutText: {
      fontSize: moderateScale(14),
      color: theme.colors.error,
      fontWeight: "500",
    },
  });
