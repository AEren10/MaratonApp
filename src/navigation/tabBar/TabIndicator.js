import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming,
} from "react-native-reanimated";
import { ANIMATION } from "../../themes/tokens";

const INSET = 4;
// Duz ve yumusak kayis (kullanici: yayli/uzayan hareket kotu). Tasma yok.
const SLIDE = { duration: 320, easing: Easing.bezier(...ANIMATION.easing.easeInOut) };

// Aktif sekmenin arkasindaki hap. Sekme degisimini navigasyon bitmeden,
// BASILDIGI AN gosterir (TabBar iyimser index verir): agir ekran acilirken
// hap beklemez.
export function TabIndicator({ index, slotWidth, C }) {
  const reduced = useReducedMotion();
  const x = useSharedValue(index * slotWidth);
  const placed = useSharedValue(0);

  useEffect(() => {
    if (!slotWidth) return;
    const to = index * slotWidth;
    if (!placed.get() || reduced) {
      x.set(to);
      placed.set(1);
      return;
    }
    x.set(withTiming(to, SLIDE));
  }, [index, slotWidth, reduced, x, placed]);

  const style = useAnimatedStyle(() => ({
    opacity: placed.get(),
    transform: [{ translateX: x.get() + INSET }],
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
