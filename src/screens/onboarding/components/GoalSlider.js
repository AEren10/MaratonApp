import { View, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as H from "../../../lib/haptics";

const THUMB_R = 14;
const TRACK_H = 6;

function snap(val, step) {
  return Math.round(val / step) * step;
}

// Hedef Seç · günlük soru hedefi sürgüsü — sınırlar arasında snap'lenir.
export function GoalSlider({ value, onChange, C, trackWidth, min, max, step }) {
  const pct = (value - min) / (max - min);
  const thumbX = useSharedValue(pct * trackWidth);
  const startX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => { startX.value = thumbX.value; })
    .onUpdate((e) => {
      const nx = Math.max(0, Math.min(trackWidth, startX.value + e.translationX));
      thumbX.value = nx;
      const raw = min + (nx / trackWidth) * (max - min);
      const snapped = Math.max(min, Math.min(max, snap(raw, step)));
      runOnJS(onChange)(snapped);
    })
    .onEnd(() => {
      const raw = min + (thumbX.value / trackWidth) * (max - min);
      const snapped = Math.max(min, Math.min(max, snap(raw, step)));
      thumbX.value = ((snapped - min) / (max - min)) * trackWidth;
      runOnJS(H.select)();
    });

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: thumbX.value - THUMB_R }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: thumbX.value }));
  const hitArea = THUMB_R * 2 + 20;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.trackWrap, { height: hitArea }]}>
        <View style={[styles.trackBg, { backgroundColor: C.track, width: trackWidth }]}>
          <Animated.View style={[styles.trackFill, { backgroundColor: C.accent }, fillStyle]} />
        </View>
        <Animated.View
          style={[styles.thumb, { backgroundColor: C.text, left: 0, top: (hitArea - THUMB_R * 2) / 2 }, thumbStyle]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  trackWrap: { justifyContent: "center" },
  trackBg: { height: TRACK_H, borderRadius: TRACK_H / 2, overflow: "hidden" },
  trackFill: { height: TRACK_H, borderRadius: TRACK_H / 2 },
  thumb: { position: "absolute", width: THUMB_R * 2, height: THUMB_R * 2, borderRadius: 6 },
});
