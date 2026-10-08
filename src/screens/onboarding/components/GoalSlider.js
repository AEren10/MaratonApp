import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as H from "../../../lib/haptics";

const THUMB_R = 14;
const TRACK_H = 6;

// onUpdate/onEnd UI thread'inde kosuyor; oradan cagrilan her fonksiyon
// worklet olmali, yoksa Reanimated "Tried to synchronously call a Remote
// Function" diye atiyor.
function snap(val, step) {
  "worklet";
  return Math.round(val / step) * step;
}

// Hedef Seç · günlük soru hedefi sürgüsü — sınırlar arasında snap'lenir.
export function GoalSlider({
  value, onChange, C, trackWidth, min, max, step, accessibilityLabel,
  fillColor = C.accent, trackColor = C.track, thumbColor = C.text,
  thumbHalfSize = THUMB_R, thumbCornerRadius = 6,
}) {
  const pct = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const thumbX = useSharedValue(pct * trackWidth);
  const thumbScale = useSharedValue(1);
  const lastSnapped = useSharedValue(value);

  useEffect(() => {
    if (trackWidth > 0 && max > min) {
      const p = Math.max(0, Math.min(1, (value - min) / (max - min)));
      thumbX.value = p * trackWidth;
      lastSnapped.value = value;
    }
  }, [value, min, max, trackWidth]);

  const updateFromX = (x) => {
    "worklet";
    if (trackWidth <= 0 || x == null) return;
    const nx = Math.max(0, Math.min(trackWidth, x));
    const raw = min + (nx / trackWidth) * (max - min);
    const snapped = Math.max(min, Math.min(max, snap(raw, step)));
    thumbX.value = ((snapped - min) / (max - min)) * trackWidth;
    if (snapped !== lastSnapped.value) {
      lastSnapped.value = snapped;
      scheduleOnRN(H.select);
      scheduleOnRN(onChange, snapped);
    }
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-6, 6])
    .onStart((e) => {
      thumbScale.value = withSpring(1.18, { damping: 15, stiffness: 350 });
      updateFromX(e.x);
    })
    .onUpdate((e) => updateFromX(e.x))
    .onEnd(() => {
      if (trackWidth <= 0 || max <= min) return;
      const raw = min + (thumbX.value / trackWidth) * (max - min);
      const snapped = Math.max(min, Math.min(max, snap(raw, step)));
      thumbX.value = ((snapped - min) / (max - min)) * trackWidth;
    })
    .onFinalize(() => {
      thumbScale.value = withSpring(1, { damping: 16, stiffness: 300 });
    });

  const tap = Gesture.Tap().onEnd((e, success) => {
    if (success) updateFromX(e.x);
  });
  const gesture = Gesture.Race(pan, tap);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value - thumbHalfSize }, { scale: thumbScale.value }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: trackWidth > 0 ? Math.max(0, Math.min(1, thumbX.value / trackWidth)) : 0 }],
  }));
  const hitArea = Math.max(44, thumbHalfSize * 2 + 20);

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.trackWrap, { height: hitArea }]}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ min, max, now: value }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={({ nativeEvent }) => {
          const delta = nativeEvent.actionName === "increment" ? step : -step;
          const next = Math.max(min, Math.min(max, value + delta));
          if (next !== value) {
            H.select();
            onChange(next);
          }
        }}
      >
        <View style={[styles.trackBg, { backgroundColor: trackColor, width: trackWidth }]}>
          <Animated.View style={[styles.trackFill, { backgroundColor: fillColor }, fillStyle]} />
        </View>
        <Animated.View
          style={[styles.thumb, {
            backgroundColor: thumbColor,
            borderRadius: thumbCornerRadius,
            height: thumbHalfSize * 2,
            left: 0,
            top: (hitArea - thumbHalfSize * 2) / 2,
            width: thumbHalfSize * 2,
          }, thumbStyle]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  trackWrap: { justifyContent: "center" },
  trackBg: { height: TRACK_H, borderRadius: TRACK_H / 2, overflow: "hidden" },
  trackFill: { width: "100%", height: TRACK_H, borderRadius: TRACK_H / 2, transformOrigin: "left" },
  thumb: { position: "absolute" },
});
