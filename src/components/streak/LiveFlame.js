import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, RadialGradient, Stop, Circle } from "react-native-svg";
import Animated, {
  cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming, withDelay,
} from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";

// Dis alev ve ic cekirdek (24x24 cizimi). Icon'daki alevle ayni siluet.
const OUTER = "M12 2c0 2 1 3.5 2.5 5 2 2 3.5 4 3.5 7a6 6 0 0 1-12 0c0-1.4.4-2.6 1-3.5C9 8 9.5 5.5 9 3c1 1 2 2 3 2-.5-1.5-.5-3 0-3z";
const CORE = "M12 10.5c.2 1.6 1.2 2.4 1.9 3.4.6.8.9 1.6.9 2.5a2.8 2.8 0 0 1-5.6 0c0-1 .4-1.8 1-2.6.8-1 1.6-1.8 1.8-3.3z";

const SOFT = Easing.bezier(0.45, 0, 0.55, 1);
// Surekli durum gostergesi (seri yaniyor): her katman kendi ritminde, birbirini
// tekrar etmeyen surelerle -- mekanik degil, canli okunur.
// reps: -1 sonsuz; sayi verilirse o kadar gidip gelip durur (cift sayi = sona dinlenir).
const loop = (to, ms, delay = 0, reps = -1) => withDelay(delay, withRepeat(withTiming(to, { duration: ms, easing: SOFT }), reps, true));

/**
 * Canli seri alevi: arkada nefes alan isik, dis alev boyuna uzayip kisalir ve
 * hafif salinir, ic cekirdek ayri ritimde atar. Hareketi azalt acikken durgun.
 * lit=false: seri yok -> gri, hareketsiz.
 */
export const LiveFlame = memo(function LiveFlame({ size = 56, lit = true, phase = 0, glow: withGlow = true, animate = false, cycles = null }) {
  const C = useC();
  const reduced = useReducedMotion();
  // PERFORMANS (4 Ekim): alev artik VARSAYILAN DURGUN. Her alev useIsFocused
  // ile sekme degisimini dinliyordu; takvimdeki 30 alev her gecis aninda
  // yeniden ciziliyor, donguler de UI thread'ini dolduruyordu -> sekme
  // gecisleri kasiyordu. animate yalniz acikca istenirse.
  const still = reduced || !lit || !animate;
  const rise = useSharedValue(0);
  const sway = useSharedValue(0);
  const core = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (still) {
      [rise, sway, core, glow].forEach((v) => { cancelAnimation(v); v.set(0); });
      return undefined;
    }
    // phase: yan yana alevler (takvim) ayni anda nefes almasin.
    // cycles: yalniz acilista N kez yanip durur (takvim kareleri, ana sayfa).
    // Sure en uzun katmana (isilti, 1300ms) gore; digerleri ayni surede biter.
    const span = cycles ? cycles * 2 * 1300 : 0;
    const reps = (ms) => (cycles ? Math.max(2, Math.round(span / ms / 2) * 2) : -1);
    rise.set(loop(1, 560, phase, reps(560)));
    sway.set(loop(1, 980, phase + 120, reps(980)));
    core.set(loop(1, 340, phase + 60, reps(340)));
    glow.set(loop(1, 1300, phase, reps(1300)));
    return () => [rise, sway, core, glow].forEach((v) => cancelAnimation(v));
  }, [still, rise, sway, core, glow, phase, cycles]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: 1 + rise.get() * 0.11 },
      { scaleX: 1 - rise.get() * 0.04 },
      { rotate: `${(sway.get() - 0.5) * 9}deg` },
    ],
  }));
  const coreStyle = useAnimatedStyle(() => ({
    opacity: 0.7 + core.get() * 0.3,
    transform: [{ scaleY: 0.86 + core.get() * 0.26 }, { scaleX: 1.04 - core.get() * 0.08 }, { translateY: -core.get() * size * 0.03 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: 0.4 + glow.get() * 0.5, transform: [{ scale: 0.9 + glow.get() * 0.18 }] }));

  const isDark = C.scheme !== "light";
  const base = lit ? C.flame : C.text3;
  const tip = lit ? (isDark ? C.warn : "#FFB800") : C.text3;
  const coreColor = lit ? (isDark ? C.warn : "#F59E0B") : C.text3;
  const box = { width: size, height: size };

  return (
    <View style={box} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {lit && withGlow ? (
        <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Defs>
              <RadialGradient id="lfGlow" cx="50%" cy="62%" r="50%">
                <Stop offset="0" stopColor={C.flame} stopOpacity={isDark ? 0.55 : 0.22} />
                <Stop offset="1" stopColor={C.flame} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={12} cy={14} r={12} fill="url(#lfGlow)" />
          </Svg>
        </Animated.View>
      ) : null}
      <Animated.View style={[StyleSheet.absoluteFill, s.origin, outerStyle]}>
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Defs>
            <LinearGradient id="lfOuter" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor={base} />
              <Stop offset="1" stopColor={tip} />
            </LinearGradient>
          </Defs>
          <Path d={OUTER} fill={lit ? "url(#lfOuter)" : "none"} stroke={lit ? "none" : base} strokeWidth={1.6} />
        </Svg>
      </Animated.View>
      {lit ? (
        <Animated.View style={[StyleSheet.absoluteFill, s.origin, coreStyle]}>
          <Svg width={size} height={size} viewBox="0 0 24 24">
            <Path d={CORE} fill={coreColor} opacity={0.95} />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  // Alev tabandan uzar: donusum merkezi altta.
  origin: { transformOrigin: "50% 90%" },
});
