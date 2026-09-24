import { memo, useMemo, useEffect } from "react";
import Svg, { Defs, LinearGradient, Path, Circle, Stop, Text as SvgText } from "react-native-svg";
import Animated, {
  cancelAnimation,
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const P = [[6, 58], [52, 54], [92, 44], [140, 34], [196, 22], [250, 14], [294, 8]];
const SAMPLES = 48;

function cubic(a, b, c, d, t) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]);
}

function pointAt(f) {
  const t = Math.max(0, Math.min(1, f)) * 2;
  return t <= 1 ? cubic(P[0], P[1], P[2], P[3], t) : cubic(P[3], P[4], P[5], P[6], t - 1);
}

const toPath = (pts) => pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
const FULL = "M 6 58 C 52 54 92 44 140 34 C 196 22 250 14 294 8";

function CurriculumCurve({ ratio = 0 }) {
  const C = useC();
  const reduced = useReducedMotion();
  const r = Math.max(0, Math.min(1, ratio));

  const pulseR = useSharedValue(11);
  const pulseOpacity = useSharedValue(0.16);

  useEffect(() => {
    if (reduced) return;
    pulseR.value = withRepeat(
      withSequence(
        withTiming(17, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(11, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      ),
      -1,
      true,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.32, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
        withTiming(0.12, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(pulseR);
      cancelAnimation(pulseOpacity);
    };
  }, [pulseR, pulseOpacity, reduced]);

  const haloProps = useAnimatedProps(() => ({
    r: pulseR.value,
    fillOpacity: pulseOpacity.value,
  }));

  const done = useMemo(() => {
    const n = Math.max(1, Math.round(SAMPLES * r));
    return toPath(Array.from({ length: n + 1 }, (_, i) => pointAt((i / n) * r)));
  }, [r]);

  const here = pointAt(r);
  const labelX = Math.max(44, Math.min(256, here[0]));
  const nodes = [0.25, 0.75].map((f) => ({ f, p: pointAt(f) }));

  return (
    <Svg viewBox="0 -18 300 108" width="100%" style={{ aspectRatio: 300 / 108 }}>
      <Defs>
        <LinearGradient id="curriculumAura" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={C.accentBright} stopOpacity={0.28} />
          <Stop offset="55%" stopColor={C.accent} stopOpacity={0.12} />
          <Stop offset="100%" stopColor={C.accent} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {[20, 40, 60].map((y) => (
        <Path key={y} d={`M 6 ${y} L 294 ${y}`} stroke={C.line} strokeWidth={0.8} opacity={0.4} strokeDasharray="3 6" />
      ))}

      <Path d={`${FULL} L 294 78 L 6 78 Z`} fill="url(#curriculumAura)" />
      <Path d={FULL} fill="none" stroke={C.border} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="3 6" />
      {r > 0 ? <Path d={done} fill="none" stroke={C.accentBright} strokeWidth={3.8} strokeLinecap="round" /> : null}

      <Circle cx={6} cy={58} r={4.6} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
      {nodes.map(({ f, p }) => (
        <Circle key={f} cx={p[0]} cy={p[1]} r={4.4} fill={C.bg} stroke={f <= r ? C.accentBright : C.stop} strokeWidth={2.2} />
      ))}
      <Circle cx={294} cy={8} r={5.4} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />

      <AnimatedCircle cx={here[0]} cy={here[1]} fill={C.accent} animatedProps={haloProps} />
      <Circle cx={here[0]} cy={here[1]} r={6.5} fill={C.accentBright} />

      <SvgText
        x={labelX}
        y={here[1] > 38 ? here[1] - 14 : here[1] + 22}
        textAnchor="middle"
        fontSize={11}
        fontWeight="700"
        letterSpacing={1.6}
        fill={C.accentBright}
      >
        BURADASIN
      </SvgText>
    </Svg>
  );
}

export default memo(CurriculumCurve);
