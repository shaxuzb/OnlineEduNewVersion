import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet } from "react-native";

interface CustomSliderProps {
  value: number;
  maximumValue: number;
  onValueChange: (value: number) => void;
  onSlidingStart: any;
  onSlidingComplete: (value: number) => void;
  style?: object;
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
      maximumValue={maximumValue}
      onSlidingStart={onSlidingStart}
      onValueChange={onValueChange}
      onSlidingComplete={onSlidingComplete}
      minimumTrackTintColor="#ff0000"
      maximumTrackTintColor="#ffffff"
      thumbTintColor="#ff0000"
    />
  );
};

const styles = StyleSheet.create({
  slider: {
    height: 40,
  },
});

export default CustomSlider;
