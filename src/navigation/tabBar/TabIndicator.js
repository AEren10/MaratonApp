import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming,
} from "react-native-reanimated";
import { ANIMATION } from "../../themes/tokens";

const INSET = 4;
// Kayis yayli (sivi his): hap hedefe akar, hafif tasip oturur. Yol uzunsa
// kayarken yatayda biraz uzar, varinca toplanir.
const SLIDE = ANIMATION.spring.default;
const STRETCH_OUT = { duration: 120, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

// Aktif sekmenin arkasindaki hap. Sekme degisimini navigasyon bitmeden,
// BASILDIGI AN gosterir (TabBar iyimser index verir): agir ekran acilirken
// hap beklemez.
export function TabIndicator({ index, slotWidth, C }) {
  const reduced = useReducedMotion();
  const x = useSharedValue(index * slotWidth);
  const stretch = useSharedValue(1);
  const placed = useSharedValue(0);

  useEffect(() => {
    if (!slotWidth) return;
    const to = index * slotWidth;
    if (!placed.get() || reduced) {
      x.set(to);
      placed.set(1);
      return;
    }
    const hops = Math.abs(to - x.get()) / slotWidth;
    x.set(withSpring(to, SLIDE));
    if (hops > 0.5) stretch.set(withSequence(withTiming(1 + Math.min(0.28, hops * 0.12), STRETCH_OUT), withSpring(1, SLIDE)));
  }, [index, slotWidth, reduced, x, stretch, placed]);

  const style = useAnimatedStyle(() => ({
    opacity: placed.get(),
    transform: [{ translateX: x.get() + INSET }, { scaleX: stretch.get() }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[s.pill, { width: Math.max(0, slotWidth - INSET * 2), backgroundColor: C.elev, borderColor: C.border }, style]}
    />
  );
}

const s = StyleSheet.create({
  pill: { position: "absolute", top: INSET, bottom: INSET, left: 0, borderRadius: 22, borderWidth: 1 },
});
