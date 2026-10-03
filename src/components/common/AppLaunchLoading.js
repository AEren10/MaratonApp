import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, ClipPath, Defs, G, Path } from "react-native-svg";
import Animated, {
  Easing, useAnimatedProps, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { ANIMATION, STEP, TYPOGRAPHY } from "../../themes/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 96;
const R = 46;
const AMP = 3.2;
const M_PATH = "M 31 63 L 31 34 L 48 51 L 65 34 L 65 63";

// Su yuzeyi: seviye (0 bos - 1 dolu) ve faz ile dalgali kapali sekil.
function wavePath(level, phase) {
  "worklet";
  const y = SIZE - level * SIZE;
  let d = `M 0 ${y}`;
  for (let x = 0; x <= SIZE; x += 6) {
    d += ` L ${x} ${y + Math.sin((x / SIZE) * Math.PI * 2 + phase) * AMP}`;
  }
  return `${d} L ${SIZE} ${SIZE} L 0 ${SIZE} Z`;
}

// Acilis: logo rozetinin ici alttan yukari kirmizi suyla dolar (dalga
// yuzeyi akar), M harfi suyun ustunde okunur. Yukleme uzarsa dolu kalir,
// dalga akmaya devam eder. Hareketi azalt acikken dolu ve durgun.
export function AppLaunchLoading() {
  const C = useC();
  const reduced = useReducedMotion();
  const level = useSharedValue(reduced ? 0.78 : 0.06);
  const phase = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    level.set(withTiming(0.78, { duration: 1800, easing: Easing.bezier(...ANIMATION.easing.easeOut) }));
    phase.set(withRepeat(withTiming(Math.PI * 2, { duration: 1400, easing: Easing.linear }), -1, false));
  }, [level, phase, reduced]);

  const back = useAnimatedProps(() => ({ d: wavePath(level.get() - 0.03, phase.get() + 1.6) }));
  const front = useAnimatedProps(() => ({ d: wavePath(level.get(), phase.get()) }));

  return (
    <View style={[s.fill, { backgroundColor: C.bg }]}>
      <View style={s.center} accessible accessibilityLabel="Maraton açılıyor">
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Defs>
            <ClipPath id="launchBadge">
              <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} />
            </ClipPath>
          </Defs>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill={C.surface} />
          <G clipPath="url(#launchBadge)">
            <AnimatedPath animatedProps={back} fill={C.accent} opacity={0.35} />
            <AnimatedPath animatedProps={front} fill={C.accent} />
          </G>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={C.border} strokeWidth={1.5} />
          <Path d={M_PATH} stroke={C.text} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
        <Text style={[TYPOGRAPHY.label, s.word, { color: C.text }]}>MARATON</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center", gap: STEP.s3 },
  word: { letterSpacing: 3 },
});
