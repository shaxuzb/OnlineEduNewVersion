/**
 * VideoControls – YouTube-like controls overlay.
 *
 * Layout:
 * ┌─────────────────────────────────────────────────────┐  ← safe-area top
 * │  [←]          Lesson title                  [⚙]    │
 * ├─────────────────────────────────────────────────────┤
 * │                                                     │
 * │           [◀10]    [▶/⏸]    [10▶]                 │  center
 * │                                                     │
 * ├─────────────────────────────────────────────────────┤
 * │  0:00  ████████▓▓░░░░░░░────────  5:00    [⛶]     │
 * └─────────────────────────────────────────────────────┘  ← safe-area bottom
 *
 * The top bar, center and bottom bar are absolutely anchored to their edges
 * (instead of relying on flex space-between) so they can never collapse or be
 * pushed off-screen. Safe-area insets are applied on ALL four edges so the
 * header/slider stay clear of the notch in landscape (the cause of the iOS
 * "header & slider not visible" bug).
 */
import React, { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/MaterialIcons";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import CustomSlider from "./CustomSlider";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(secs: number): string {
  if (!isFinite(secs) || isNaN(secs) || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

const TOP_GRAD = [
  "rgba(0,0,0,0.85)",
  "rgba(0,0,0,0.45)",
  "transparent",
] as string[];
const BOTTOM_GRAD = [
  "transparent",
  "rgba(0,0,0,0.45)",
  "rgba(0,0,0,0.90)",
] as string[];

// ─── types ────────────────────────────────────────────────────────────────────
interface VideoControlsProps {
  paused: boolean;
  onPlayPause: () => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  handleBack: () => void;
  currentTime: number;
  duration: number;
  buffered: number;
  fullscreen: boolean;
  onFullscreen: () => void;
  toggleSettings: () => void;
  buffering: boolean;
  title: string;
  onSlidingStart: () => void;
  onSliderValueChange: (v: number) => void;
  onSlidingComplete: (v: number) => void;
}

// ─── component ────────────────────────────────────────────────────────────────
const VideoControls: React.FC<VideoControlsProps> = ({
  paused,
  onPlayPause,
  onSeekBackward,
  onSeekForward,
  handleBack,
  currentTime,
  duration,
  buffered,
  fullscreen,
  onFullscreen,
  toggleSettings,
  buffering,
  title,
  onSlidingStart,
  onSliderValueChange,
  onSlidingComplete,
}) => {
  const insets = useSafeAreaInsets();
  // Respect every edge. Left/right matter in landscape (notch / home-indicator),
  // which is exactly when the video is watched fullscreen.
  const padTop = Math.max(insets.top, moderateScale(8));
  const padBottom = Math.max(insets.bottom, moderateScale(8));
  const padLeft = Math.max(insets.left, moderateScale(12));
  const padRight = Math.max(insets.right, moderateScale(12));
  const maxVal = duration > 0 ? duration : 1;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* ── CENTER (rendered first so the bars stay on top) ──── */}
      <View style={styles.center} pointerEvents="box-none">
        {buffering ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <View style={styles.centerRow}>
            {/* Skip -10s */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onSeekBackward}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Icon name="replay-10" size={moderateScale(42)} color="#fff" />
            </TouchableOpacity>

            {/* Play / Pause */}
            <TouchableOpacity
              style={styles.playBtn}
              onPress={onPlayPause}
              activeOpacity={0.75}
            >
              <Icon
                name={paused ? "play-arrow" : "pause"}
                size={moderateScale(46)}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Skip +10s */}
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onSeekForward}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            >
              <Icon name="forward-10" size={moderateScale(42)} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── TOP ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.topGrad,
          { paddingTop: padTop, paddingLeft: padLeft, paddingRight: padRight },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back-ios" size={moderateScale(22)} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {title}
          </Text>

          <TouchableOpacity
            onPress={toggleSettings}
            style={styles.iconBtn}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={moderateScale(21)}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM ──────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomGrad,
          {
            paddingBottom: padBottom,
            paddingLeft: padLeft,
            paddingRight: padRight,
          },
        ]}
        pointerEvents="box-none"
      >
        {/* time + slider + duration + fullscreen */}
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{fmt(currentTime)}</Text>

          <CustomSlider
            value={currentTime}
            maximumValue={maxVal}
            buffered={buffered}
            onSlidingStart={onSlidingStart}
            onValueChange={onSliderValueChange}
            onSlidingComplete={onSlidingComplete}
            style={styles.slider}
          />

          <Text style={styles.time}>{fmt(duration)}</Text>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onFullscreen}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Icon
              name={fullscreen ? "fullscreen-exit" : "fullscreen"}
              size={moderateScale(24)}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // top — anchored to the top edge
  topGrad: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: moderateScale(24),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(8),
  },
  iconBtn: {
    padding: moderateScale(6),
    minWidth: moderateScale(36),
    alignItems: "center",
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: moderateScale(14),
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: moderateScale(4),
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    lineHeight: moderateScale(18),
  },

  // center — fills the whole overlay, content centered
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(30),
  },
  skipBtn: {
    padding: moderateScale(8),
    borderRadius: moderateScale(32),
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  playBtn: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    backgroundColor: "rgba(0,0,0,0.50)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.30)",
    justifyContent: "center",
    alignItems: "center",
  },

  // bottom — anchored to the bottom edge
  bottomGrad: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: moderateScale(24),
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: moderateScale(10),
    paddingBottom: moderateScale(6),
  },
  slider: {
    flex: 1,
    marginHorizontal: moderateScale(6),
  },
  time: {
    color: "#fff",
    fontSize: moderateScale(11),
    fontWeight: "600",
    minWidth: moderateScale(34),
    textShadowColor: "rgba(0,0,0,0.95)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: "center",
  },
});

export default memo(VideoControls);
