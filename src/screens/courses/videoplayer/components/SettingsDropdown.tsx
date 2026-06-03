import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";

const { height: screenHeight } = Dimensions.get("window");

const PLAYBACK_RATES = [
  { label: "0.5x", value: 0.5 },
  { label: "0.75x", value: 0.75 },
  { label: "Normal", value: 1.0 },
  { label: "1.25x", value: 1.25 },
  { label: "1.5x", value: 1.5 },
  { label: "2.0x", value: 2.0 },
] as const;

interface SettingsDropdownProps {
  visible: boolean;
  onClose: () => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}

const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  visible,
  onClose,
  playbackRate,
  onPlaybackRateChange,
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 180,
      useNativeDriver: true,
    }).start();
  }, [visible, animValue]);

  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  const opacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      supportedOrientations={["portrait", "landscape"]}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[styles.container, { opacity, transform: [{ translateY }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tezlik</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={moderateScale(22)} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.ratesContainer}>
            {PLAYBACK_RATES.map((rate) => {
              const isActive = playbackRate === rate.value;
              return (
                <TouchableOpacity
                  key={rate.value}
                  style={[styles.rateRow, isActive && styles.rateRowActive]}
                  onPress={() => {
                    onPlaybackRateChange(rate.value);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.rateLabel, isActive && styles.rateLabelActive]}
                  >
                    {rate.label}
                  </Text>
                  {isActive && (
                    <Ionicons
                      name="checkmark"
                      size={moderateScale(18)}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-start",
    paddingTop: screenHeight * 0.1,
    paddingHorizontal: moderateScale(20),
  },
  container: {
    backgroundColor: "rgba(22,22,24,0.97)",
    borderRadius: moderateScale(14),
    padding: moderateScale(18),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(14),
    paddingBottom: moderateScale(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(17),
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  ratesContainer: {
    gap: moderateScale(6),
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: moderateScale(13),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(10),
    backgroundColor: "rgba(44,44,46,0.8)",
  },
  rateRowActive: {
    backgroundColor: "rgba(0,122,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,122,255,0.35)",
  },
  rateLabel: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontWeight: "500",
  },
  rateLabelActive: {
    color: "#007AFF",
    fontWeight: "700",
  },
});

export default memo(SettingsDropdown);
