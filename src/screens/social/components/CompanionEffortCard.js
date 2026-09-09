import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SPACING, RADIUS, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const DAYS = ["P", "S", "Ç", "P", "C", "C", "P"];

function byDay(entries = []) {
  const result = Array(7).fill(0);
  entries.forEach((entry) => {
    const day = new Date(`${entry.date}T12:00:00`).getDay();
    const index = day === 0 ? 6 : day - 1;
    result[index] += Number(entry.minutes) || 0;
  });
  return result;
}

function EffortLine({ color, data, label }) {
  const max = Math.max(1, ...data);
  return (
    <View style={styles.line} accessibilityLabel={`${label} haftalık çalışma çizgisi`}>
      <Text style={[styles.lineLabel, { color }]} numberOfLines={1}>{label}</Text>
      <View style={styles.bars}>
        {data.map((value, index) => (
          <View key={`${label}-${index}`} style={styles.barSlot}>
            <View style={[styles.bar, { backgroundColor: color, height: 5 + (value / max) * 27 }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function CompanionEffortCard({ dashboard }) {
  const C = useC();
  const own = useMemo(() => byDay(dashboard?.self?.daily), [dashboard?.self?.daily]);
  const other = useMemo(() => byDay(dashboard?.other?.daily), [dashboard?.other?.daily]);
  const name = dashboard?.companion?.name || "Yol arkadaşın";
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Text style={[styles.eyebrow, { color: C.muted }]}>BU HAFTA · EMEK</Text>
      <Text style={[styles.title, { color: C.text }]}>Yan yana ilerliyorsunuz</Text>
      <View style={styles.chart}>
        <EffortLine color={C.accent} data={own} label="Sen" />
        <EffortLine color={C.orange} data={other} label={name} />
        <View style={styles.days}>{DAYS.map((day, i) => <Text key={`${day}-${i}`} style={[styles.day, { color: C.muted }]}>{day}</Text>)}</View>
      </View>
      <Text style={[styles.note, { color: C.sec }]}>
        Birlikte {dashboard?.together?.activeDays || 0} aktif gün · toplam {dashboard?.together?.minutes || 0} dakika
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: RADIUS.xxl, padding: SPACING.lg },
  eyebrow: { ...TYPOGRAPHY.label },
  title: { ...TYPOGRAPHY.subheading, marginTop: SPACING.sm },
  chart: { marginTop: SPACING.xl, gap: SPACING.md },
  line: { flexDirection: "row", alignItems: "flex-end", gap: SPACING.sm },
  lineLabel: { ...TYPOGRAPHY.captionMedium, width: 76 },
  bars: { flex: 1, height: 36, flexDirection: "row", alignItems: "flex-end", gap: SPACING.sm },
  barSlot: { flex: 1, height: 36, justifyContent: "flex-end" },
  bar: { width: "100%", minHeight: 5, borderRadius: RADIUS.sm },
  days: { marginLeft: 84, flexDirection: "row", gap: SPACING.sm },
  day: { ...TYPOGRAPHY.micro, flex: 1, textAlign: "center" },
  note: { ...TYPOGRAPHY.caption, marginTop: SPACING.xl },
});
