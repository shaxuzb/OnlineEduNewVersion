import { lightColors } from "@/src/constants/theme";
import { OrderItem } from "@/src/types";
import { formatDateTime, numberSpacing } from "@/src/utils";
import {
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

type PaymentOrderCardStyles = {
  card: ViewStyle;
  subject: TextStyle;
  date: TextStyle;
  row: ViewStyle;
  price: TextStyle;
  status: TextStyle;
  pending: TextStyle;
  paid: TextStyle;
  canceled: TextStyle;
  payButton: ViewStyle;
  payButtonText: TextStyle;
};

export default function PaymentOrderCard({
  order,
  styles,
}: {
  order: OrderItem;
  styles: PaymentOrderCardStyles;
}) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.subject}>Sotuv turi: {order.scopeType}</Text>
        <Text style={styles.date}>Sana: {formatDateTime(order.createdAt)}</Text>
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
        <Pressable
          android_ripple={{
            foreground: true,
            color: lightColors.ripple,
          }}
          style={styles.payButton}
        >
          <Text style={styles.payButtonText}>To‘lash</Text>
        </Pressable>
      )}
    </View>
  );
}
