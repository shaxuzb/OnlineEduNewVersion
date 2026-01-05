import EmptyData from "@/src/components/exceptions/EmptyData";
import ErrorData from "@/src/components/exceptions/ErrorData";
import LoadingData from "@/src/components/exceptions/LoadingData";
import { useTheme } from "@/src/context/ThemeContext";
import { useOrders } from "@/src/hooks/useOrders";
import { Theme } from "@/src/types";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PaymentOrderCard from "./components/PaymentOrderCard";
const PaymentOrders = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { data, isLoading, isError, refetch } = useOrders();
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {isLoading ? (
        <LoadingData />
      ) : isError ? (
        <ErrorData refetch={refetch} />
      ) : data && data.results.length > 0 ? (
        <FlatList
          data={data.results}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          windowSize={2}
          style={{
            paddingTop: 15,
            paddingBottom: 15,
            paddingHorizontal: 10,
          }}
          renderItem={({ item }) => (
            <PaymentOrderCard key={item.id} order={item} styles={styles} />
          )}
        />
      ) : (
        <EmptyData />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: 50,
      backgroundColor: theme.colors.background,
    },

    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: theme.colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    subject: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    date: {
      color: theme.colors.textMuted,
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
      color: theme.colors.text,
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
