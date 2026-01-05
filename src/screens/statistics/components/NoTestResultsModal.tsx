import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTheme } from "@react-navigation/native";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

interface NoTestResultsModalProps {
  visible: boolean;
  onClose: () => void;
  // onPress: () => void;
}

export default function NoTestResultsModal({
  visible,
  onClose,
  // onPress,
}: NoTestResultsModalProps) {
  const { dark } = useTheme();
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
          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <FontAwesome6 name="exclamation" size={24} color="#f6833bff" />
            </View>
            <Text style={[styles.title, { color: dark ? "#fff" : "#111827" }]}>
              Testni yeching!
            </Text>
            <Text
              style={[styles.subtitle, { color: dark ? "#D1D5DB" : "#4B5563" }]}
            >
              Avval ushbu mavzuni testini yechishingiz kerak!
            </Text>
          </View>

          {/* Buttons */}
          {/* <TouchableOpacity onPress={onPress} style={styles.buyButton}>
            <Text style={styles.buyText}>Mavzuga o'tish</Text>
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
    backgroundColor: "#fef2dbff",
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
