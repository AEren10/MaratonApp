import { useEffect } from "react";
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from "react-native-reanimated";
import { Circle, Line, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Hedef bayragi: hedef cizgisinin ucunda. Grafik cizilince bayrak uc kez
// dalgalanip durur (kullanici, 3 Ekim). Surekli dalga dikkat dagitirdi;
// grafik her giriste yeniden kuruldugu icin dalga her giriste bir kez oynar.
const POLE = 26;
const FLAG_W = 17;
const FLAG_H = 11;
const WAVE = { duration: 420, easing: Easing.inOut(Easing.sin) };

export function RouteTargetFlag({ x, y, C }) {
  const reduced = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    t.set(withDelay(900, withRepeat(withTiming(1, WAVE), 6, true)));
  }, [reduced, t]);

  const top = y == null ? 0 : Math.max(2, y - POLE);
  // Bayragin ucu ve ortasi zit yonde oynar: kumas dalgasi gibi okunur.
  const flagProps = useAnimatedProps(() => {
    const k = (t.get() - 0.5) * 2;
    const tipY = top + FLAG_H / 2 + k * 2.2;
    const midY = top + FLAG_H / 2 - k * 1.6;
    const tipX = x + FLAG_W - Math.abs(k) * 1.2;
    return {
      d: `M${x},${top} Q${x + FLAG_W / 2},${top + 1 - k * 1.6} ${tipX},${tipY} Q${x + FLAG_W / 2},${midY + FLAG_H / 2} ${x},${top + FLAG_H} Z`,
    };
  });

  if (x == null || y == null) return null;
  return (
    <>
      <Circle cx={x} cy={y} r={9} fill={C.accent} fillOpacity={0.18} />
      <Line x1={x} y1={y} x2={x} y2={top} stroke={C.accent} strokeWidth={2} strokeLinecap="round" />
      <AnimatedPath animatedProps={flagProps} fill={C.accent} />
    </>
  );
}
