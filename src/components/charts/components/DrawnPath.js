import { useEffect, useRef } from "react";
import { Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// AGENTS.md'nin imza anlarindan biri: "hat cizilir, dugum oturur."
// Cizgi bastan sona kendini cizer, kirmizi bir sey firlamaz.
const DRAW_MS = 900;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

// Duz cizgi uzunlugu bezier'den bir tik kisa kalir; az fazla tahmin
// etmek, cizginin bir kismi hep gorunur kalmasindan iyidir.
const SLACK = 1.06;

/**
 * Acilista kendini cizen SVG yolu. Sonraki veri degisikliklerinde
 * yeniden cizilmez -- o zaman yol zaten yerinde, tekrar cizmek
 * "az once ne yaptin" degil "sayfa yeniden yuklendi" gibi okunur.
 */
export function DrawnPath({ d, length, delay = 0, ...rest }) {
  const reduced = useReducedMotion();
  const total = Math.max(1, length * SLACK);
  const offset = useSharedValue(reduced ? 0 : total);
  const drawn = useRef(false);

  useEffect(() => {
    if (drawn.current) return;
    drawn.current = true;
    if (reduced) {
      offset.set(0);
      return;
    }
    offset.set(withDelay(delay, withTiming(0, { duration: DRAW_MS, easing: EASE_OUT })));
  }, [delay, reduced, offset, total]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: offset.get() }));

  return (
    <AnimatedPath
      d={d}
      strokeDasharray={total}
      animatedProps={animatedProps}
      {...rest}
    />
  );
}
