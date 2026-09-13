import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const SEGMENT_TONE = { completed: "accent", rescheduled: "barIdle", queued: "track" };

// "Rotanın tamamı" ust blogu: "7/11 durak tamamlandı.", durak cubuklari,
// lejant ve BORÇ · YENİDEN PLANLANAN · SINAVA uclusu.
export function RouteFullSummary({ counts, segments, debtHours, daysLeft }) {
  const C = useC();
  const legend = [
    { tone: "accent", text: `tamamlandı ${counts.completed}` },
    { tone: "barIdle", text: `yeniden planlandı ${counts.rescheduled}` },
    { tone: "track", text: `sırada ${counts.queued}` },
  ];
  const stats = [
    { label: "BORÇ", value: debtHours, unit: "sa" },
    { label: "YENİDEN PLANLANAN", value: counts.rescheduled, unit: "durak" },
    Number.isFinite(daysLeft) ? { label: "SINAVA", value: daysLeft, unit: "gün" } : null,
  ].filter(Boolean);

  return (
    <View>
      <Text style={[TYPOGRAPHY.statSmall, s.headline, { color: C.text }]}>
        {counts.completed}/{counts.total} durak tamamlandı.
      </Text>
      <View style={s.bars} accessible accessibilityLabel={`${counts.total} duraktan ${counts.completed} tamamlandı`}>
        {segments.map((kind, i) => (
          <View key={`${kind}-${i}`} style={[s.bar, { backgroundColor: C[SEGMENT_TONE[kind]] }]} />
        ))}
      </View>
      <View style={s.legend}>
        {legend.map((item) => (
          <View key={item.tone} style={s.legendItem}>
            <View style={[s.swatch, { backgroundColor: C[item.tone] }]} />
            <Text style={[TYPOGRAPHY.tableHead, s.legendText, { color: C.text3 }]}>{item.text}</Text>
          </View>
        ))}
      </View>
      <View style={s.stats}>
        {stats.map((stat, i) => (
          <Fragment key={stat.label}>
            {i > 0 ? <View style={[s.divider, { backgroundColor: C.line }]} /> : null}
            <View>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{stat.label}</Text>
              <View style={s.statRow}>
                <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{stat.value}</Text>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{stat.unit}</Text>
              </View>
            </View>
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  headline: { maxWidth: 290 },
  bars: { flexDirection: "row", gap: STEP.s1 / 2, marginTop: STEP.s3 },
  bar: { flex: 1, height: 5, borderRadius: SHAPE.chip / 3 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s2, marginTop: STEP.s2 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: STEP.s1 / 2 },
  swatch: { width: 12, height: 4, borderRadius: SHAPE.chip / 3 },
  legendText: { letterSpacing: 0 },
  stats: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s3, marginTop: STEP.s3 },
  divider: { width: 1, height: 34 },
  statRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 / 2, marginTop: STEP.s1 / 2 },
});
