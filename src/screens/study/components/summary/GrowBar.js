import { memo, useEffect } from "react";
import Animated, {
  Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";

import { ANIMATION } from "../../../../themes/tokens";

// Ozet grafiginin cubugu: acilista alttan buyur (aciklama: donemin nasil
// dolduğu soldan saga okunur). Yalniz ilk acilista; veri degisirse yeniden
// buyumez. Toplam kademe 180ms ile sinirli -- 30 cubuklu ay gorunumunde uzun
// bir dalga olmasin. scaleY + alt orijin: duzen hesabi yok.
const GROW = { duration: 420, easing: Easing.bezier(...ANIMATION.easing.easeOut) };
const MAX_STAGGER = 180;

export const GrowBar = memo(function GrowBar({ index = 0, count = 1, style }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) { p.set(1); return; }
    const step = Math.min(30, MAX_STAGGER / Math.max(1, count));
    p.set(withDelay(index * step, withTiming(1, GROW)));
  }, [p, reduced, index, count]);
  const grow = useAnimatedStyle(() => ({ transform: [{ scaleY: 0.02 + p.get() * 0.98 }] }));
  return <Animated.View style={[style, { transformOrigin: "bottom" }, grow]} />;
});
