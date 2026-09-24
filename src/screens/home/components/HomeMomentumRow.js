import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Line, Circle } from "react-native-svg";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press, PRESS_ROW } from "../../../components/design/Press";

const W = 132;
const H_HEIGHT = 40;
const PAD = 5;

function sparkline(nets) {
  const min = Math.min(...nets);
  const max = Math.max(...nets);
  const span = max - min || 1;
  const step = (W - PAD * 2) / Math.max(1, nets.length - 1);
  const pts = nets.map((n, i) => [PAD + i * step, H_HEIGHT - PAD - ((n - min) / span) * (H_HEIGHT - PAD * 2)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return { d, area: `${d} L${lx.toFixed(1)} ${H_HEIGHT} L${PAD} ${H_HEIGHT} Z`, lx, ly, base: (H_HEIGHT - PAD - ((nets[0] - min) / span) * (H_HEIGHT - PAD * 2)) };
}

const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 });

// "DİKKAT ÇEKEN İKİ DERS" satiri: son net, iki deneme arasi fark, mini hat.
export const HomeMomentumRow = React.memo(function HomeMomentumRow({ subject, onPress }) {
  const C = useC();
  const g = useMemo(() => sparkline(subject.nets), [subject.nets]);
  const up = subject.delta > 0;
  const delta = subject.delta === 0 ? "0" : `${up ? "+" : "−"}${fmt(Math.abs(subject.delta))}`;

  return (
    <Press
      onPress={() => onPress?.(subject.key, subject.name)}
      scaleTo={PRESS_ROW}
      accessible
      accessibilityLabel={`${subject.name}, ${fmt(subject.currentNet)} net, fark ${delta}. Ders detayına git.`}
      style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}
    >
      <View style={s.flex}>
        <View style={s.nameRow}>
          <View style={[s.swatch, { backgroundColor: subject.color }]} />
          <Text numberOfLines={1} style={[TYPOGRAPHY.bodySemiBold, s.name, { color: C.text }]}>{subject.name}</Text>
        </View>
        <View style={s.netRow}>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{fmt(subject.currentNet)}</Text>
          <Text style={[TYPOGRAPHY.metaSemiBold, s.num, { color: up ? C.up : C.down }]}>{delta}</Text>
        </View>
      </View>
      <Svg width={W} height={H_HEIGHT} style={s.svg}>
        <Line x1={0} y1={g.base} x2={W} y2={g.base} stroke={C.track} strokeWidth={1} strokeDasharray="2 4" />
        <Path d={g.area} fill={subject.color} fillOpacity={0.14} />
        <Path d={g.d} fill="none" stroke={subject.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={g.lx} cy={g.ly} r={4.5} fill={subject.color} />
      </Svg>
    </Press>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 4, padding: STEP.s3 - 2,
    marginBottom: STEP.s1, borderRadius: SHAPE.card, borderWidth: 1,
  },
  flex: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  swatch: { width: 7, height: 7, borderRadius: SHAPE.chip / 6 },
  name: { fontSize: TYPOGRAPHY.bodySemiBold.fontSize + 1 },
  netRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 + 1, marginTop: STEP.s1 / 2 + 1 },
  num: { fontSize: TYPOGRAPHY.micro.fontSize + 0.5, fontVariant: ["tabular-nums"] },
  svg: { overflow: "visible" },
});
