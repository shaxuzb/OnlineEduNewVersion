import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";

interface PurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export default function PurchaseModal({
  visible,
  onClose,
  onPurchase,
}: PurchaseModalProps) {
  const { colors, dark } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            { backgroundColor: dark ? "#1F2937" : "#fff" },
          ]}
          onPress={() => {}}
        >
          {/* Lock Icon */}
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <FontAwesome6 name="lock" size={24} color="#3B82F6" />
            </View>
            <Text
              style={[
                styles.title,
                { color: dark ? "#fff" : "#111827" },
              ]}
            >
              Avval ushbu mavzuni sotib oling!
            </Text>
            {/* <Text
              style={[
                styles.subtitle,
                { color: dark ? "#D1D5DB" : "#4B5563" },
              ]}
            >
              Avval ushbu kursni sotib olishingiz kerak
            </Text> */}
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={onPurchase} style={styles.buyButton}>
            <Text style={styles.buyText}>Sotib olish</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={onClose}
            style={[
              styles.cancelButton,
              { backgroundColor: dark ? "#374151" : "#F3F4F6" },
            ]}
          >
            <Text
              style={[
                styles.cancelText,
                { color: dark ? "#D1D5DB" : "#374151" },
              ]}
            >
              Bekor qilish
            </Text>
          </TouchableOpacity> */}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: 320,
    borderRadius: 24,
    padding: 24,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  buyButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  buyText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 16,
  },
  cancelText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "500",
  },
});
