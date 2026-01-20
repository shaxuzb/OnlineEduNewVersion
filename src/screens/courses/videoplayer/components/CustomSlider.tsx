// CustomSlider.tsx
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Slider from "@react-native-community/slider";

interface CustomSliderProps {
  value: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  onSlidingStart: () => void;
  onSlidingComplete: (value: number) => void;
  style?: ViewStyle;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  maximumValue,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  style,
}) => {
  return (
    <Slider
      style={[styles.slider, style]}
      value={value}
      minimumValue={0}
      maximumValue={maximumValue}
      onSlidingStart={onSlidingStart}
      onValueChange={onValueChange}
      onSlidingComplete={onSlidingComplete}
      minimumTrackTintColor="#FF3B30"
      maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
      thumbTintColor="#FF3B30"
      tapToSeek={true}
      step={1}
    />
  );
};

const styles = StyleSheet.create({
  slider: {
    height: 40,
    flex: 1,
  },
});

export default CustomSlider;