import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { ANIMATION } from "../../themes/tokens";

const GROW = { duration: 600, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

// Ilerleme cizgisi: ekrana girince soldan dolar, deger degisince yeni
// degere akar. Ana sayfadaki durak parcalariyla (ProgressSegment) ayni
// hareket -- uygulamada "ilerleme" tek bir sekilde hareket eder.
export const GrowBar = memo(function GrowBar({ value = 0, color, track, height = 4, delay = 120, style }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? value : 0);
  useEffect(() => {
    const to = Math.max(0, Math.min(1, value));
    p.set(reduced ? to : withDelay(delay, withTiming(to, GROW)));
  }, [value, reduced, delay, p]);
  const fill = useAnimatedStyle(() => ({ width: `${p.get() * 100}%` }));
  return (
    <View style={[s.track, { height, borderRadius: height / 2, backgroundColor: track }, style]}>
      <Animated.View style={[s.fill, { borderRadius: height / 2, backgroundColor: color }, fill]} />
    </View>
  );
});

const s = StyleSheet.create({
  track: { overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
});
