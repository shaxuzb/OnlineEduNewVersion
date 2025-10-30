import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useOrders } from "@/src/hooks/useOrders";
import { Theme } from "@/src/types";
import { formatDateTime, numberSpacing } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const PaymentOrders = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { data, isLoading, isError, refetch } = useOrders();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingBottom: 50,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mening to‘lovlarim</Text>
      </View>
      {isLoading ? (
        <LoadingData />
      ) : isError ? (
        <ErrorData refetch={refetch} />
      ) : data && data.results.length > 0 ? (
        <ScrollView contentContainerStyle={styles.container}>
          {data.results.map((order) => (
            <View key={order.id} style={styles.card}>
              <View>
                <Text style={styles.subject}>Fan: {order.scopeType}</Text>
                <Text style={styles.date}>
                  Sana: {formatDateTime(order.createdAt)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.price}>
                  {numberSpacing(order.price)} {order.currency}
                </Text>
                <Text
                  style={[
                    styles.status,
                    order.status === "Kutilmoqda"
                      ? styles.pending
                      : order.status === "To‘langan"
                      ? styles.paid
                      : styles.canceled,
                  ]}
                >
                  {order.status}
                </Text>
              </View>

              {order.status === "Kutilmoqda" && (
                <TouchableOpacity style={styles.payButton}>
                  <Text style={styles.payButtonText}>To‘lash</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>Topilmadi</Text>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: "row",
      gap: 20,
      alignItems: "center",
    },
    headerTitle: {
      color: "white",
      fontSize: 20,
      fontWeight: "600",
    },
    backButton: {
      marginLeft: 0,
    },
    container: {
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      color: "#000",
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    subject: {
      fontSize: 16,
      fontWeight: "600",
      color: "#000",
    },
    date: {
      color: "#999",
      marginTop: 2,
      fontSize: 14,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    price: {
      fontSize: 18,
      fontWeight: "700",
      color: "#000",
    },
    status: {
      fontSize: 16,
      fontWeight: "600",
    },
    pending: {
      color: "#E0A100",
    },
    paid: {
      color: "#16A34A",
    },
    canceled: {
      color: "#EF4444",
    },
    payButton: {
      backgroundColor: "#007BFF",
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 12,
    },
    payButtonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
      fontSize: 16,
    },
  });

export default PaymentOrders;
