import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

const W = 340;
const H = 190;
const PAD = { l: 30, r: 14, t: 16, b: 34 };

const short = (name) => String(name || "").split(" ")[0].slice(0, 6);

// Iki deneme, ders ders: x = ders, y = net. Eski deneme soluk ve kesikli,
// yeni deneme kirmizi ve duz. Hangi derste ayrildiklari tek bakista.
export const TrialCompareChart = React.memo(function TrialCompareChart({ C, rows, olderLabel, newerLabel }) {
  const pts = rows.filter((r) => Number.isFinite(r.nRaw));
  if (pts.length < 2) return null;
  const all = pts.flatMap((r) => [r.nRaw, r.oRaw]).filter((v) => Number.isFinite(v));
  const max = Math.max(...all, 1);
  const min = Math.min(0, ...all);
  const x = (i) => PAD.l + (i / (pts.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - min) / (max - min || 1)) * (H - PAD.t - PAD.b);
  const line = (key) => pts.map((r, i) => `${x(i)},${y(r[key])}`).join(" ");
  const hasOld = pts.every((r) => Number.isFinite(r.oRaw));
  const grid = [min, (min + max) / 2, max];

  return (
    <View>
      <View style={s.legend}>
        {hasOld ? <Legend C={C} color={C.text3} dashed label={olderLabel} /> : null}
        <Legend C={C} color={C.accent} label={newerLabel} />
      </View>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {grid.map((g) => (
          <React.Fragment key={g}>
            <Line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke={C.line} strokeWidth={1} />
            <SvgText x={PAD.l - 6} y={y(g) + 4} fill={C.text4} fontSize={11} textAnchor="end">{Math.round(g)}</SvgText>
          </React.Fragment>
        ))}
        {hasOld ? <Polyline points={line("oRaw")} fill="none" stroke={C.text3} strokeWidth={2} strokeDasharray="5 5" /> : null}
        <Polyline points={line("nRaw")} fill="none" stroke={C.accent} strokeWidth={3} strokeLinejoin="round" />
        {pts.map((r, i) => (
          <React.Fragment key={r.key}>
            {hasOld ? <Circle cx={x(i)} cy={y(r.oRaw)} r={3.5} fill={C.bg} stroke={C.text3} strokeWidth={1.5} /> : null}
            <Circle cx={x(i)} cy={y(r.nRaw)} r={5} fill={C.accent} />
            <SvgText x={x(i)} y={H - 12} fill={C.text3} fontSize={11} textAnchor="middle">{short(r.name)}</SvgText>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
});

function Legend({ C, color, label, dashed }) {
  return (
    <View style={s.item}>
      <View style={[s.swatch, { backgroundColor: dashed ? "transparent" : color, borderColor: color, borderStyle: dashed ? "dashed" : "solid" }]} />
      <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  legend: { flexDirection: "row", gap: STEP.s3, marginBottom: STEP.s1 },
  item: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 16, height: 0, borderTopWidth: 2 },
});
