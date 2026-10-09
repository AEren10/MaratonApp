import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from "react-native-reanimated";

const SIZE = 20;
const IN_MS = 1100;
const REST_MS = 1500;
const CYCLES = 5;
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

// "Buraya dokun" isareti: noktanin etrafinda genis, silik bir halka belirip
// noktaya dogru kuculerek soner. Nokta kendisi oynamaz. Halkalar sirayla
// (index'e gore gecikme) gelir; birkac turdan sonra durur -- surekli dongu
// sekme gecislerini agirlastiriyordu (LiveFlame notu, 4 Ekim).
export function RouteDotBeacon({ x, y, color, index = 0 }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(600 + index * 220, withRepeat(withSequence(
      withTiming(1, { duration: IN_MS, easing: EASE }),
      withTiming(1, { duration: REST_MS }),
      withTiming(0, { duration: 0 }),
    ), CYCLES, false)));
  }, [reduced, index, t]);

  const style = useAnimatedStyle(() => {
    const v = t.get();
    // 0 -> 1: buyukten noktaya; opaklik once artar sonra soner.
    const opacity = v <= 0 || v >= 1 ? 0 : v < 0.35 ? (v / 0.35) * 0.7 : 0.7 * (1 - (v - 0.35) / 0.65);
    return { opacity, transform: [{ scale: 2.2 - v * 1.3 }] };
  });

  if (reduced) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[s.ring, { left: x - SIZE / 2, top: y - SIZE / 2, borderColor: color }, style]}
    />
  );
}

const s = StyleSheet.create({
  ring: { position: "absolute", width: SIZE, height: SIZE, borderRadius: SIZE / 2, borderWidth: 1.5, zIndex: 4 },
});
