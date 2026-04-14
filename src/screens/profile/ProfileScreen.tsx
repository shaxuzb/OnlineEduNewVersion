import { alertService } from "@/src/components/modals/customalert/alertService";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useGeo } from "@/src/hooks/useGeo";
import { useSession } from "@/src/hooks/useSession";
import { Theme } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import React, { memo, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "react-native-size-matters";

const menuItems = [
  {
    id: 1,
    title: "Shaxsiy ma'lumotlar",
    icon: "person-outline",
    hasArrow: true,
    code: "personal_info",
  },
  {
    id: 3,
    title: "Tungi rejim",
    icon: "moon-outline",
    hasToggle: true,
    code: "dark_mode",
  },
  {
    id: 4,
    title: "A'loqa",
    icon: "mail-outline",
    hasArrow: true,
    code: "contact",
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
    code: "payment_orders",
  },
];

const TELEGRAM_URL = "https://t.me/bobomurod_math";
const SUPPORT_PHONE_NUMBER = "+998934620036";
const SUPPORT_PHONE_DISPLAY = "+998 93 462 00 36";

function ProfileScreen() {
  const navigation = useNavigation();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(theme);
  const { isSuperAdmin } = useSession();
  const { countryCode } = useGeo();
  const contactBottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [moderateScale(230)], []);

  const openContactBottomSheet = useCallback(() => {
    contactBottomSheetRef.current?.snapToIndex(0);
  }, []);

  const closeContactBottomSheet = useCallback(() => {
    contactBottomSheetRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleLogout = () => {
    alertService.open({
      type: "warning",
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

  const handleLinkToAdmin = useCallback(async () => {
    await Linking.openURL(TELEGRAM_URL);
    closeContactBottomSheet();
  }, [closeContactBottomSheet]);

  const handleCallSupport = useCallback(async () => {
    await Linking.openURL(`tel:${SUPPORT_PHONE_NUMBER}`);
    closeContactBottomSheet();
  }, [closeContactBottomSheet]);

  const handleMenuItemPress = (item: (typeof menuItems)[0]) => {
    if (item.id === 1) {
      // Shaxsiy ma'lumotlar
      (navigation as any).navigate("PersonalInfo");
    } else if (item.id === 4) {
      // A'loqa
      openContactBottomSheet();
    } else if (item.id === 5) {
      // Dastur haqida
      Alert.alert("Ma'lumot", "Dastur haqida bo'limi hali tayyor emas");
    } else if (item.id === 6) {
      // Kurs to'lovlari
      (navigation as any).navigate("PaymentOrders");
    }
  };
  const getInitials = (name?: string) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase();
    }

    return parts[0][0]?.toUpperCase() + parts[1][0]?.toUpperCase();
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
            <LinearGradient
              colors={["#3a5dde", "#5e84e6"]}
              start={{ x: 0.5, y: 1.0 }}
              end={{ x: 0.5, y: 0.0 }}
              style={{
                borderRadius: moderateScale(50),
              }}
            >
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.fullName || user?.userName)}
                </Text>
              </View>
            </LinearGradient>
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
              (item) =>
                !(item.id === 6 && isSuperAdmin && countryCode === "UZ"),
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

      <BottomSheet
        ref={contactBottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        backgroundStyle={styles.contactSheetBackground}
        handleIndicatorStyle={styles.contactHandleIndicator}
      >
        <BottomSheetView style={styles.contactSheetContent}>
          <View style={styles.contactSheetHeader}>
            <Text style={styles.contactSheetTitle}>Aloqa</Text>
            <Pressable
              style={styles.contactCloseButton}
              onPress={closeContactBottomSheet}
            >
              <Ionicons
                name="close"
                size={moderateScale(20)}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <Pressable
            style={styles.contactActionButton}
            onPress={handleLinkToAdmin}
          >
            <Ionicons
              name="paper-plane-outline"
              size={moderateScale(22)}
              color={theme.colors.primary}
            />
            <View style={styles.contactActionTextContainer}>
              <Text style={styles.contactActionTitle}>Telegramda yozish</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(20)}
              color={theme.colors.textMuted}
            />
          </Pressable>

          <Pressable
            style={styles.contactActionButton}
            onPress={handleCallSupport}
          >
            <Ionicons
              name="call-outline"
              size={moderateScale(22)}
              color={theme.colors.primary}
            />
            <View style={styles.contactActionTextContainer}>
              <Text style={styles.contactActionTitle}>
                {SUPPORT_PHONE_DISPLAY}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={moderateScale(20)}
              color={theme.colors.textMuted}
            />
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
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
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      fontSize: moderateScale(32),
      fontWeight: "700",
      color: "#fff",
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
    contactSheetBackground: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
    },
    contactHandleIndicator: {
      backgroundColor: theme.colors.border,
    },
    contactSheetContent: {
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(16),
      gap: moderateScale(10),
    },
    contactSheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: moderateScale(6),
    },
    contactSheetTitle: {
      fontSize: moderateScale(16),
      fontWeight: "600",
      color: theme.colors.text,
    },
    contactCloseButton: {
      width: moderateScale(32),
      height: moderateScale(32),
      borderRadius: moderateScale(16),
      alignItems: "center",
      justifyContent: "center",
    },
    contactActionButton: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: moderateScale(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: moderateScale(12),
      paddingHorizontal: moderateScale(12),
      gap: moderateScale(10),
    },
    contactActionTextContainer: {
      flex: 1,
    },
    contactActionTitle: {
      fontSize: moderateScale(14),
      fontWeight: "600",
      color: theme.colors.text,
    },
    contactActionSubtitle: {
      marginTop: moderateScale(2),
      fontSize: moderateScale(12),
      color: theme.colors.textSecondary,
    },
  });
