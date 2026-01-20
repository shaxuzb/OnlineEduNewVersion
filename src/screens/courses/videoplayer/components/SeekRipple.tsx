// SeekRipple.tsx
import Icon from '@expo/vector-icons/Ionicons';
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  SharedValue,
} from "react-native-reanimated";
import { moderateScale } from 'react-native-size-matters';

interface SeekRippleProps {
  side: "left" | "right";
  active: SharedValue<boolean>;
  text: string;
}

const SeekRipple: React.FC<SeekRippleProps> = ({ side, active, text }) => {
  const rippleStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active.value ? 1 : 0, { duration: 300 }),
      transform: [
        { scale: withTiming(active.value ? 1 : 0.8, { duration: 300 }) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.rippleContainer,
        side === "left" ? styles.leftRipple : styles.rightRipple,
        rippleStyle,
      ]}
      pointerEvents="none"
    >
      <Animated.View style={styles.ripple}>
        <Icon
          name={side === "left" ? "play-back" : "play-forward"}
          size={moderateScale(28)}
          color="#fff"
        />
        <Text style={styles.rippleText}>{text}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rippleContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
    zIndex: 10,
  },
  leftRipple: {
    left: 0,
  },
  rightRipple: {
    right: 0,
  },
  ripple: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: moderateScale(50),
    gap: 8,
    justifyContent: "center",
    padding: moderateScale(16),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  rippleText: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "500",
  },
});

export default SeekRipple;