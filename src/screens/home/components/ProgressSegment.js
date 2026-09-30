import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { ANIMATION, SHAPE } from "../../../themes/tokens";

// Gunun ilerleme parcasi. Durak bitince parca soldan DOLAR (durum
// gostergesi: hangi parcanin neden doldugu gorunur); eskiden renk aniden
// degisiyordu. Dolgu mutlak konumlu ve cocuksuz: scaleX duzen hesaplatmaz.
const GROW = { duration: 220, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export const ProgressSegment = memo(function ProgressSegment({ filled, color, track, style }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(filled ? 1 : 0);
  useEffect(() => { p.set(reduced ? (filled ? 1 : 0) : withTiming(filled ? 1 : 0, GROW)); }, [filled, reduced, p]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: p.get() }] }));
  return (
    <View style={[style, s.clip, { backgroundColor: track }]}>
      <Animated.View style={[s.fill, { backgroundColor: color }, fill]} />
    </View>
  );
});

const s = StyleSheet.create({
  clip: { overflow: "hidden", borderRadius: SHAPE.chip },
  fill: { ...StyleSheet.absoluteFillObject, transformOrigin: "left" },
});
