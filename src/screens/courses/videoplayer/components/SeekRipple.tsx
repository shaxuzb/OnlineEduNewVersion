/**
 * SeekRipple – YouTube-style double-tap seek indicator.
 *
 * Visual:
 *  - Semi-circular arc that covers left/right 40% of the screen
 *  - 3 expanding "wave" rings that radiate outward
 *  - Skip-direction arrows  ◀◀  or  ▶▶
 *  - Accumulated seconds label  -10s / +30s / …
 *
 * Animation is 100% on the UI thread (Reanimated shared values).
 * `seekSeconds` is read via useAnimatedReaction → no setInterval polling.
 */
import React, { memo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";

interface SeekRippleProps {
  side: "left" | "right";
  /** 1 = fully visible → animates to 0 */
  active: SharedValue<number>;
  seekSeconds: SharedValue<number>;
}

// ─── Wave ring (pure Reanimated, no JS setState) ──────────────────────────────
const WaveRing = memo(
  ({
    active,
    delay,
    isLeft,
  }: {
    active: SharedValue<number>;
    delay: number;
    isLeft: boolean;
  }) => {
    const animStyle = useAnimatedStyle(() => {
      // Each ring lags behind `active` to simulate expanding wave
      const shifted = Math.max(0, active.value - delay * (1 - active.value));
      const opacity = interpolate(active.value, [0, 0.3, 0.8, 1], [0, 0.6, 0.35, 0], Extrapolation.CLAMP);
      const scale   = interpolate(active.value, [0, 1], [0.6, 1.25], Extrapolation.CLAMP);
      return { opacity, transform: [{ scale }] };
    });

    return (
      <Animated.View
        style={[
          styles.ring,
          isLeft ? styles.ringLeft : styles.ringRight,
          animStyle,
        ]}
      />
    );
  },
);

// ─── Main component ───────────────────────────────────────────────────────────
const SeekRipple: React.FC<SeekRippleProps> = ({ side, active, seekSeconds }) => {
  const [displaySecs, setDisplaySecs] = useState(10);
  const isLeft = side === "left";

  // Sync JS display label when shared value changes (worklet → JS thread)
  useAnimatedReaction(
    () => seekSeconds.value,
    (curr, prev) => {
      if (curr !== prev) runOnJS(setDisplaySecs)(curr);
    },
    [seekSeconds],
  );

  // Container fade + slight scale pulse
  const containerStyle = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [
      { scale: interpolate(active.value, [0, 0.15, 1], [0.85, 1.02, 1], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        isLeft ? styles.posLeft : styles.posRight,
        containerStyle,
      ]}
      pointerEvents="none"
    >
      {/* Wave rings (decorative, do not intercept touches) */}
      <WaveRing active={active} delay={0}    isLeft={isLeft} />
      <WaveRing active={active} delay={0.12} isLeft={isLeft} />
      <WaveRing active={active} delay={0.24} isLeft={isLeft} />

      {/* Arc pill */}
      <View style={[styles.pill, isLeft ? styles.pillLeft : styles.pillRight]}>
        {/* Arrow row */}
        <View style={styles.arrowRow}>
          {isLeft ? (
            <>
              <Text style={styles.arrow}>◀</Text>
              <Text style={styles.arrow}>◀</Text>
            </>
          ) : (
            <>
              <Text style={styles.arrow}>▶</Text>
              <Text style={styles.arrow}>▶</Text>
            </>
          )}
        </View>
        {/* Seconds label */}
        <Text style={styles.secsLabel}>
          {isLeft ? `-${displaySecs}s` : `+${displaySecs}s`}
        </Text>
      </View>
    </Animated.View>
  );
};

// ─── styles ───────────────────────────────────────────────────────────────────
const RING_SIZE = moderateScale(130);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "42%",
    justifyContent: "center",
    alignItems: "center",
    // NOTE: no zIndex here — the controls overlay is rendered AFTER the ripples
    // in VideoPlayerCore and must stay on top. A positive zIndex used to lift the
    // (transparent) ripple above the header/slider on iOS.
  },
  posLeft:  { left: 0 },
  posRight: { right: 0 },

  // ── wave rings ────────────────────────────────────────────────
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "transparent",
  },
  ringLeft:  { left: -RING_SIZE * 0.35 },
  ringRight: { right: -RING_SIZE * 0.35 },

  // ── pill ──────────────────────────────────────────────────────
  pill: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(18),
    alignItems: "center",
    gap: moderateScale(5),
    // half-ellipse shape
    borderRadius: moderateScale(100),
  },
  pillLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    alignSelf: "flex-start",
    paddingLeft: moderateScale(26),
    marginLeft: -moderateScale(12),
  },
  pillRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    alignSelf: "flex-end",
    paddingRight: moderateScale(26),
    marginRight: -moderateScale(12),
  },

  // ── text ──────────────────────────────────────────────────────
  arrowRow: {
    flexDirection: "row",
    gap: -moderateScale(3),
  },
  arrow: {
    color: "#fff",
    fontSize: moderateScale(13),
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secsLabel: {
    color: "#fff",
    fontSize: moderateScale(12),
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default memo(SeekRipple);
