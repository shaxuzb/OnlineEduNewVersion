// SettingsDropdown.tsx
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

const { height: screenHeight } = Dimensions.get("window");

export const SettingsDropdown: React.FC<{
  visible: boolean;
  onClose: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}> = ({ visible, onClose, playbackRate, onPlaybackRateChange }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const playbackRates = [
    { label: "0.5x", value: 0.5 },
    { label: "0.75x", value: 0.75 },
    { label: "Normal", value: 1.0 },
    { label: "1.25x", value: 1.25 },
    { label: "1.5x", value: 1.5 },
    { label: "2.0x", value: 2.0 },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.dropdownContainer,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Tezlik</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={moderateScale(24)} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.playbackRatesContainer}>
              {playbackRates.map((rate) => (
                <TouchableOpacity
                  key={rate.value}
                  style={[
                    styles.playbackRateButton,
                    playbackRate === rate.value &&
                      styles.playbackRateButtonActive,
                  ]}
                  onPress={() => {
                    onPlaybackRateChange(rate.value);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.playbackRateText,
                      playbackRate === rate.value &&
                        styles.playbackRateTextActive,
                    ]}
                  >
                    {rate.label}
                  </Text>
                  {playbackRate === rate.value && (
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(20)}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-start",
    paddingTop: screenHeight * 0.1,
  },
  dropdownContainer: {
    backgroundColor: "rgba(28, 28, 30, 0.95)",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3A3A3C",
  },
  dropdownTitle: {
    color: "#FFF",
    fontSize: moderateScale(18),
    fontWeight: "600",
  },
  playbackRatesContainer: {
    gap: 12,
  },
  playbackRateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(44, 44, 46, 0.9)",
  },
  playbackRateButtonActive: {
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  playbackRateText: {
    color: "#FFF",
    fontSize: moderateScale(16),
    fontWeight: "500",
  },
  playbackRateTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
