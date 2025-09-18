import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  useColorScheme,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AuthUserData } from "../../types";
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from "../../utils";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? COLORS.dark : COLORS.light;

  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debug: user ma'lumotlarini ko'rish (development uchun)
  // console.log("PersonalInfoScreen - User data:", user);

  const refetch = async () => {
    // User ma'lumotlari AuthContext dan keladi, qayta yuklash kerak emas
    setIsLoading(false);
  };

  // Ma'lumotlar strukturasi
  const userData = user;

  // renderInfoItem funksiyasi yangi design da ishlatilmaydi

  const renderPermissions = () => {
    if (!user?.permissions || user.permissions.length === 0) {
      return null;
    }

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: isDark ? "#374151" : "white" },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="key"
            size={24}
            color="#2465CB"
            style={{ marginRight: 12 }}
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "white" : "#111827" },
            ]}
          >
            Ruxsatlar
          </Text>
        </View>
        <View style={styles.permissionsContainer}>
          {user.permissions.map((permission, index) => (
            <View
              key={index}
              style={[
                styles.permissionChip,
                { backgroundColor: "#2465CB" + "20" },
              ]}
            >
              <Text style={[styles.permissionText, { color: "#2465CB" }]}>
                {permission}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderModules = () => {
    if (!user?.modules || user.modules.length === 0) {
      return null;
    }

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: isDark ? "#374151" : "white" },
        ]}
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="library"
            size={24}
            color="#2465CB"
            style={{ marginRight: 12 }}
          />
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "white" : "#111827" },
            ]}
          >
            Modullar
          </Text>
        </View>
        <View style={styles.modulesContainer}>
          {user.modules.map((moduleId, index) => (
            <View
              key={index}
              style={[styles.moduleChip, { backgroundColor: "#10B981" + "20" }]}
            >
              <Text style={[styles.moduleText, { color: "#10B981" }]}>
                Modul {moduleId}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shaxsiy ma'lumotlar</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2465CB"
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.loadingText}>Ma'lumotlar yuklanmoqda...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shaxsiy ma'lumotlar</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <View
            style={[
              styles.errorIconContainer,
              { backgroundColor: isDark ? "#7F1D1D" : "#FECACA" },
            ]}
          >
            <Ionicons
              name="warning"
              size={50}
              color={isDark ? "#EF4444" : "#DC2626"}
            />
          </View>
          <Text
            style={[styles.errorTitle, { color: isDark ? "white" : "#111827" }]}
          >
            Ma'lumotlar yuklanmadi
          </Text>
          <Text
            style={[
              styles.errorMessage,
              { color: isDark ? "#9CA3AF" : "#6B7280" },
            ]}
          >
            Internet aloqangizni tekshiring va qayta urinib ko'ring
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shaxsiy ma'lumotlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#2465CB"
            colors={["#2465CB"]}
          />
        }
      >
        {/* Header gradientli qism */}
        <View style={styles.profileHeader}>
          {/* Profile rasm */}
          <View style={styles.profileImageContainer}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          {/* Foydalanuvchi ismi */}
          <Text style={styles.profileName}>
            {userData?.fullName || "Foydalanuvchi"}
          </Text>

          {/* Rol */}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {userData?.role || "Foydalanuvchi"}
            </Text>
          </View>
        </View>

        {/* Ma'lumotlar kartochkalari */}
        <View style={styles.cardsContainer}>
          {/* Asosiy ma'lumotlar */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#374151" : "white" },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="person-circle"
                size={24}
                color="#2465CB"
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                Asosiy ma'lumotlar
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                To'liq ism
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                {userData?.fullName || "Ma'lumot yo'q"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Foydalanuvchi nomi
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="at"
                  size={18}
                  color="#2465CB"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "white" : "#111827" },
                  ]}
                >
                  {userData?.userName || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Lavozim
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                {userData?.role || "Ma'lumot yo'q"}
              </Text>
            </View>
          </View>

          {/* Aloqa ma'lumotlari */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#374151" : "white" },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="call"
                size={24}
                color="#2465CB"
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                Aloqa ma'lumotlari
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Telefon raqam
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="call"
                  size={18}
                  color="#2465CB"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "white" : "#111827" },
                  ]}
                >
                  {userData?.phoneNumber || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Hudud
              </Text>
              <View style={styles.infoWithIcon}>
                <Ionicons
                  name="location"
                  size={18}
                  color="#2465CB"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "white" : "#111827" },
                  ]}
                >
                  {userData?.state || "Ma'lumot yo'q"}
                </Text>
              </View>
            </View>
          </View>

          {/* Hisob ma'lumotlari */}
          <View
            style={[
              styles.card,
              { backgroundColor: isDark ? "#374151" : "white" },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color="#2465CB"
                style={{ marginRight: 12 }}
              />
              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                Hisob ma'lumotlari
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                ID
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDark ? "white" : "#111827" },
                ]}
              >
                {userData?.id || "Ma'lumot yo'q"}
              </Text>
            </View>

            <View style={styles.infoRowLast}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
              >
                Hisob holati
              </Text>
              <View style={styles.infoWithIcon}>
                <View style={styles.statusDot} />
                <Text
                  style={[
                    styles.infoValue,
                    { color: isDark ? "white" : "#111827" },
                  ]}
                >
                  {userData?.state || "Faol"}
                </Text>
              </View>
            </View>
          </View>

          {/* Ruxsatlar va Modullar */}
          {renderPermissions()}
          {renderModules()}

          {/* Yangilash tugmasi */}
          <TouchableOpacity
            onPress={() => refetch()}
            disabled={isLoading}
            style={[
              styles.refreshButtonLarge,
              { opacity: isLoading ? 0.7 : 1 },
            ]}
          >
            <View style={styles.refreshButtonContent}>
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Ionicons
                  name="refresh"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text style={styles.refreshButtonText}>
                {isLoading ? "Yangilanmoqda..." : "Ma'lumotlarni yangilash"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header styles
  header: {
    backgroundColor: "#2465CB",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    marginLeft: 0,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  placeholder: {
    width: 32,
  },

  // Profile header styles
  profileHeader: {
    backgroundColor: "#2465CB",
    paddingTop: 40,
    paddingBottom: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    marginBottom: -30,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    color: "white",
    fontWeight: "500",
  },

  // Cards container
  cardsContainer: {
    padding: 20,
    marginTop: 30,
  },

  // Card styles
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Info row styles
  infoRow: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  infoRowLast: {
    backgroundColor: "transparent",
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  // Status dot
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B7280",
  },

  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#2465CB",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  // Permissions and modules
  section: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  permissionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  permissionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modulesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moduleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moduleText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Refresh button
  refreshButtonLarge: {
    backgroundColor: "#2465CB",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
