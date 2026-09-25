import { useEffect, useRef } from "react";
import { Circle } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Dugum, hat ona ULASTIGI anda oturur -- hepsi birden belirirse hattin
// nereye kadar cizildigi okunmaz.
const SETTLE_MS = 260;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
// Hicbir sey yoktan belirmez: kucukten buyur, sifirdan degil.
const FROM = 0.55;

export function SettlingNode({ r, delay = 0, ...rest }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(reduced ? 1 : 0);
  const settled = useRef(false);

  useEffect(() => {
    if (settled.current) return;
    settled.current = true;
    if (reduced) { t.set(1); return; }
    t.set(withDelay(delay, withTiming(1, { duration: SETTLE_MS, easing: EASE_OUT })));
  }, [delay, reduced, t]);

  const animatedProps = useAnimatedProps(() => {
    const v = t.get();
    return { r: r * (FROM + (1 - FROM) * v), opacity: v };
  });

  return <AnimatedCircle animatedProps={animatedProps} {...rest} />;
}

/** Noktalarin hat boyunca birikmis uzunluguna gore gecikmeleri. */
export function nodeDelays(points, drawMs) {
  if (!points || points.length < 2) return points?.map(() => 0) || [];
  const seg = [0];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy);
    seg.push(total);
  }
  return seg.map((s) => (total > 0 ? Math.round((s / total) * drawMs) : 0));
}
