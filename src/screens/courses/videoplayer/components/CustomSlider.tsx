/**
 * CustomSlider – YouTube-style progress bar with buffer track.
 *
 * ┌──────────────────────────────────────────────────┐
 * │ ██████████▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │
 * │  played   buffered           remaining            │
 * └──────────────────────────────────────────────────┘
 *
 * ### Why a separate internal state?
 * @react-native-community/slider bridges to native. While the user is
 * dragging, the native layer owns the thumb position.  If the React `value`
 * prop changes during that drag (e.g. because `onProgress` fires), the
 * bridge tries to reset the native position → visible jitter / shake.
 *
 * Fix: we track an internal `localValue` that:
 *  • syncs from the parent prop only when NOT sliding
 *  • is updated by the slider's own onValueChange during sliding
 * The parent prop is used solely for the custom track visualisation
 * (played / buffered bars) — that update is harmless because the track
 * is a plain View, not a bridged native component.
 */
import React, { memo, useEffect, useRef, useState } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Slider from "@react-native-community/slider";

// ─── colours ──────────────────────────────────────────────────────────────────
const C_PLAYED   = "#FF0000";                      // YouTube red
const C_BUFFERED = "rgba(255,255,255,0.40)";
const C_REMAIN   = "rgba(255,255,255,0.18)";
const C_THUMB    = "#FF0000";

// ─── props ────────────────────────────────────────────────────────────────────
interface CustomSliderProps {
  value: number;
  maximumValue: number;
  buffered?: number;
  onValueChange: (v: number) => void;
  onSlidingStart: () => void;
  onSlidingComplete: (v: number) => void;
  style?: ViewStyle;
}

// ─── component ────────────────────────────────────────────────────────────────
const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  maximumValue,
  buffered = 0,
  onValueChange,
  onSlidingStart,
  onSlidingComplete,
  style,
}) => {
  const safeMax = maximumValue > 0 ? maximumValue : 1;

  // ── Anti-shake internal state ──────────────────────────────────
  const acceptRef = useRef(true);          // true = accept parent value updates
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (acceptRef.current) setLocalValue(value);
  }, [value]);

  // ── Custom track fractions (use parent value – always smooth) ──
  const playedFrac   = Math.min(1, value / safeMax);
  const bufferedFrac = Math.min(1, buffered / safeMax);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSlidingStart = () => {
    acceptRef.current = false;   // stop syncing from parent during drag
    onSlidingStart();
  };

  const handleValueChange = (v: number) => {
    setLocalValue(v);            // track finger position internally
    onValueChange(v);            // let parent update time labels
  };

  const handleSlidingComplete = (v: number) => {
    setLocalValue(v);
    acceptRef.current = true;    // re-enable parent syncing
    onSlidingComplete(v);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <View style={[styles.wrapper, style]}>
      {/* Custom track (played / buffered / remaining) */}
      <View style={styles.track} pointerEvents="none">
        {/* remaining */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: C_REMAIN, borderRadius: 2 }]} />
        {/* buffered */}
        <View
          style={[
            styles.trackFill,
            { width: `${bufferedFrac * 100}%`, backgroundColor: C_BUFFERED },
          ]}
        />
        {/* played */}
        <View
          style={[
            styles.trackFill,
            { width: `${playedFrac * 100}%`, backgroundColor: C_PLAYED },
          ]}
        />
      </View>

      {/* Native slider — gesture only, track is transparent */}
      <Slider
        style={styles.slider}
        value={localValue}
        minimumValue={0}
        maximumValue={safeMax}
        onSlidingStart={handleSlidingStart}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor="transparent"
        maximumTrackTintColor="transparent"
        thumbTintColor={C_THUMB}
        tapToSeek
        step={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 28,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  trackFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
  },
  slider: {
    width: "100%",
    height: 28,
  },
});

export default memo(CustomSlider);
