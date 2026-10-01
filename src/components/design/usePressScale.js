import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { ANIMATION } from "../../themes/tokens";

const EASE_OUT = Easing.bezier(...ANIMATION.easing.easeOut);
const { scale: PRESS_SCALE, duration: PRESS_MS } = ANIMATION.press;

// Basma geri bildirimi: 130ms'lik sakin olcek (Press ile ayni his). Gunde
// onlarca kez basilan seyde yay yok -- yay hafif tasiyor ve "ziplak" okunuyor.
// Azaltilmis harekette olcek yok.
export function usePressScale(scaleTo = PRESS_SCALE) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const to = (v) => { if (!reduced) scale.set(withTiming(v, { duration: PRESS_MS, easing: EASE_OUT })); };
  return { style, onIn: () => to(scaleTo), onOut: () => to(1) };
}
