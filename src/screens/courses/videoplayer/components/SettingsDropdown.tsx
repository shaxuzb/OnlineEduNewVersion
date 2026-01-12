import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Modal, Text, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const SettingsDropdown: React.FC<{
  visible: boolean;
  onClose: () => void;
  styles: any;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
}> = ({ visible, onClose, playbackRate, onPlaybackRateChange, styles }) => {
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
      onRequestClose={onClose}
    >
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
              <Ionicons name="close" size={moderateScale(22)} color="#FFF" />
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
                  <Ionicons name="checkmark" size={moderateScale(18)} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
