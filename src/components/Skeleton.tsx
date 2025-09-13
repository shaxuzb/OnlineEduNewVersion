import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  colorMode?: "light" | "dark";
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  radius = 4,
  colorMode = "light",
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange:
      colorMode === "dark" ? ["#374151", "#4B5563"] : ["#E5E7EB", "#F3F4F6"],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;