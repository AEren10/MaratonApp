import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming,
} from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { ANIMATION } from "../../themes/tokens";
import { BrandMark } from "../design/BrandMark";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const W = 220;
const H = 72;
// Rota: soldan saga yukselen yumusak bir hat. DASH, hattin boyundan buyuk
// olmali (yaklasik 230) -- yoksa cizim sonunda bir parca eksik kalir.
const ROUTE = "M12 52 C 52 52, 70 20, 110 32 S 168 60, 208 22";
const DASH = 320;
const STOPS = [
  { x: 12, y: 52, at: 0 },
  { x: 110, y: 32, at: 400 },
  { x: 208, y: 22, at: 760 },
];
const DRAW_MS = 800;
const GLOW_MS = 500;
const BRAND_AT = 550;
const BRAND_MS = 550;
// Parlama bitince (1.3 sn) icerik yumusakca solar, sonra uygulama acilir:
// sayfa animasyonun ortasinda "ucarak" gelmez. Toplam ~1.6 sn.
const FADE_AT = DRAW_MS + GLOW_MS;
const FADE_MS = 280;
const TOTAL_MS = FADE_AT + FADE_MS;
const EASE = Easing.bezier(...ANIMATION.easing.easeOut);

// Ilk acilista bir kez oynar; sonra (ornegin profil yuklenirken) son kare durgun gosterilir.
let played = false;

function Stop({ x, y, at, stroke, fill, instant }) {
  const k = useSharedValue(instant ? 1 : 0);
  useEffect(() => {
    if (!instant) k.set(withDelay(at, withTiming(1, { duration: 500, easing: EASE })));
  }, [at, instant, k]);
  const props = useAnimatedProps(() => ({ r: 5.5 * k.get(), opacity: k.get() }));
  return <AnimatedCircle cx={x} cy={y} fill={fill} stroke={stroke} strokeWidth={2.5} animatedProps={props} />;
}

// ACILIS — imza an "durak tamamlandi": hat cizilir, duraklar oturur, varis
// noktasi bir kez parlar; ardindan marka asagidan belirir. Iki hareket turu:
// cizim + solma/olcek. Konfeti/ses yok. `onDone` yalniz animasyon BITINCE cagrilir.
export function AppLaunchLoading({ onDone }) {
  const C = useC();
  const reduced = useReducedMotion();
  const instant = played || reduced;

  const draw = useSharedValue(instant ? 1 : 0);
  const glow = useSharedValue(0);
  const brand = useSharedValue(instant ? 1 : 0);
  const out = useSharedValue(1);

  useEffect(() => {
    if (!instant) {
      draw.set(withTiming(1, { duration: DRAW_MS, easing: Easing.inOut(Easing.cubic) }));
      glow.set(withDelay(DRAW_MS, withTiming(1, { duration: GLOW_MS, easing: EASE })));
      brand.set(withDelay(BRAND_AT, withTiming(1, { duration: BRAND_MS, easing: EASE })));
    }
    if (!onDone) return undefined;
    if (!instant) out.set(withDelay(FADE_AT, withTiming(0, { duration: FADE_MS, easing: EASE })));
    const t = setTimeout(() => {
      played = true;
      onDone();
    }, instant ? 250 : TOTAL_MS);
    return () => clearTimeout(t);
    // Yalniz ilk montajda: tekrar render animasyonu bastan baslatmamali.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathProps = useAnimatedProps(() => ({ strokeDashoffset: DASH * (1 - draw.get()) }));
  const glowProps = useAnimatedProps(() => ({
    r: 6 + glow.get() * 18,
    opacity: glow.get() > 0 ? 0.5 * (1 - glow.get()) : 0,
  }));
  const brandStyle = useAnimatedStyle(() => ({
    opacity: brand.get(),
    transform: [{ translateY: (1 - brand.get()) * 10 }],
  }));

  const outStyle = useAnimatedStyle(() => ({ opacity: out.get() }));

  const last = STOPS[STOPS.length - 1];

  return (
    <View style={[s.fill, { backgroundColor: C.bg }]} accessible accessibilityLabel="Maraton açılıyor">
      <Animated.View style={[s.center, outStyle]}>
        <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Path d={ROUTE} stroke={C.track} strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" fill="none" />
          <AnimatedPath
            d={ROUTE}
            stroke={C.accent}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${DASH} ${DASH}`}
            animatedProps={pathProps}
          />
          <AnimatedCircle cx={last.x} cy={last.y} fill={C.accent} animatedProps={glowProps} />
          {STOPS.map((p, i) => (
            <Stop
              key={`stop-${i}`}
              {...p}
              instant={instant}
              stroke={C.accent}
              fill={i === STOPS.length - 1 ? C.accent : C.bg}
            />
          ))}
        </Svg>
        <Animated.View style={[s.brand, brandStyle]}>
          <BrandMark width={46} word wordSize={17} color={C.text} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center" },
  brand: { marginTop: 28 },
});
