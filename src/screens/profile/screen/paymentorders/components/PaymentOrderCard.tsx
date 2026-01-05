import { lightColors } from "@/src/constants/theme";
import { OrderItem } from "@/src/types";
import { formatDateTime, numberSpacing } from "@/src/utils";
import { Pressable, Text, View } from "react-native";

export default function PaymentOrderCard({
  order,
  styles,
}: {
  order: OrderItem;
  styles: any;
}) {
  return (
    <View key={order.id} style={styles.card}>
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
