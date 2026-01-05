import Icon from '@expo/vector-icons/Ionicons';
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
interface SeekRippleProps {
  side: "left" | "right";
  active: any;
  text: string;
}
const SeekRipple: React.FC<SeekRippleProps> = ({ side, active, text }) => {
  const rippleStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(active.value ? 1 : 0, { duration: 300 }),
      transform: [
        { scale: withTiming(active.value ? 1 : 0.97, { duration: 300 }) },
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
    >
      <Animated.View style={[styles.ripple]}>
        <Icon
          name={side === "left" ? "play-back" : "play-forward"}
          size={25}
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
  },
  leftRipple: {
    left: 0,
  },
  rightRipple: {
    right: 0,
  },
  ripple: {
    borderRadius: 50,
    gap: 8,
    justifyContent: "center",
    padding: 20,
    alignItems: "center",
  },
  rippleText: {
    color: "#fff",
    fontSize: 14,
  },
});

export default SeekRipple;
