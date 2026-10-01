import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { ANIMATION, SHAPE } from "../../../themes/tokens";

// Gunun ilerleme parcasi. Durak bitince parca soldan DOLAR (durum
// gostergesi: hangi parcanin neden doldugu gorunur); eskiden renk aniden
// degisiyordu. Dolgu mutlak konumlu ve cocuksuz: genislik animasyonu guvenli
// (animate-expo istisnasi). Ilk surum scaleX + transformOrigin idi; iOS'ta
// dolgu hic gorunmedi (1 Ekim, 8/8 iken parcalar gri).
const GROW = { duration: 220, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export const ProgressSegment = memo(function ProgressSegment({ filled, color, track, style }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => { p.set(reduced ? (filled ? 1 : 0) : withTiming(filled ? 1 : 0, GROW)); }, [filled, reduced, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  return (
    <View style={[style, s.clip, { backgroundColor: track }]}>
      <Animated.View style={[s.fill, { backgroundColor: color }, fill]} />
    </View>
  );
});

const s = StyleSheet.create({
  clip: { overflow: "hidden", borderRadius: SHAPE.chip },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
});
