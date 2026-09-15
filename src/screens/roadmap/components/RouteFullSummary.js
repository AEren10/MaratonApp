import { Fragment } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const SEGMENT_TONE = { completed: "accent", rescheduled: "barIdle", queued: "track" };

export function RouteFullSummary({ counts, segments, debtHours, daysLeft }) {
  const C = useC();
  const legend = [
    { tone: "accent", text: "tamamlandı " },
    { tone: "barIdle", text: "yeniden planlandı " },
    { tone: "track", text: "sırada " },
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
      <View style={s.bars} accessible accessibilityLabel={${counts.total} duraktan  tamamlandı}>
        {segments.map((kind, i) => (
          <View key={${kind}-} style={[s.bar, { backgroundColor: C[SEGMENT_TONE[kind]] }]} />
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
  headline: { paddingBottom: STEP.s2 },
  bars: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2 },
  legend: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s2, paddingBottom: STEP.s4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  swatch: { width: 12, height: 4, borderRadius: 2 },
  legendText: { marginTop: 1 },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: STEP.s3,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "transparent",
  },
  divider: { width: 1, marginVertical: 4 },
  statRow: { flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 },
});
