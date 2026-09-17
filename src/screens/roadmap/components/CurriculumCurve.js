import { memo, useMemo } from "react";
import Svg, { Defs, LinearGradient, Path, Circle, Stop, Text as SvgText } from "react-native-svg";

import { useC } from "../../../contexts/ThemeContext";

// Tasarimin mufredat egrisi (viewBox 0 -8 300 76): iki kubik bezier.
// Dolu kisim bitirilen konu oranina kadar cizilir; "BURADASIN" dugumu orada.
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
const FULL = `M 6 58 C 52 54 92 44 140 34 C 196 22 250 14 294 8`;

function CurriculumCurve({ ratio = 0 }) {
  const C = useC();
  const r = Math.max(0, Math.min(1, ratio));
  const done = useMemo(() => {
    const n = Math.max(1, Math.round(SAMPLES * r));
    return toPath(Array.from({ length: n + 1 }, (_, i) => pointAt((i / n) * r)));
  }, [r]);
  const here = pointAt(r);
  const labelX = Math.max(40, Math.min(260, here[0]));
  const nodes = [0.25, 0.75].map((f) => ({ f, p: pointAt(f) }));

  return (
    <Svg viewBox="0 -14 300 92" width="100%" style={{ aspectRatio: 300 / 92 }}>
      <Defs>
        <LinearGradient id="curriculumGlow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={C.accent} stopOpacity={0.15} />
          <Stop offset="0.55" stopColor={C.accent} stopOpacity={0.35} />
          <Stop offset="1" stopColor={C.accent} stopOpacity={0.08} />
        </LinearGradient>
      </Defs>
      {[18, 38, 58].map((y) => (
        <Path key={y} d={`M 6 ${y} L 294 ${y}`} stroke={C.line} strokeWidth={0.8} opacity={0.55} />
      ))}
      <Path d={`${FULL} L294 70 L6 70 Z`} fill="url(#curriculumGlow)" opacity={0.36} />
      <Path d={FULL} fill="none" stroke={C.track} strokeWidth={2.6} strokeLinecap="round" />
      {r > 0 ? <Path d={done} fill="none" stroke={C.accent} strokeWidth={4.8} strokeLinecap="round" /> : null}
      <Circle cx={6} cy={58} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
      {nodes.map(({ f, p }) => (
        <Circle key={f} cx={p[0]} cy={p[1]} r={4.2} fill={C.bg} stroke={f <= r ? C.accent : C.stop} strokeWidth={2.2} />
      ))}
      <Circle cx={294} cy={8} r={5.2} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
      <Circle cx={here[0]} cy={here[1]} r={11} fill={C.accent} opacity={0.16} />
      <Circle cx={here[0]} cy={here[1]} r={6.5} fill={C.accent} />
      <SvgText
        x={labelX}
        y={here[1] > 40 ? here[1] - 12 : here[1] + 20}
        textAnchor="middle"
        fontFamily="Archivo_700"
        fontSize={11}
        letterSpacing={1.4}
        fill={C.accent}
      >
        BURADASIN
      </SvgText>
    </Svg>
  );
}

export default memo(CurriculumCurve);
