import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function WeekProgressCard({ rangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const C = useC();
  const completedStops = Math.max(0, Math.min(7, Number(activeDaysCount) || 0));
  const totalStops = 7;
  const pct = Math.min(1, completedStops / totalStops);

  const hasWork = totalMinutes > 0 || totalQuestions > 0 || completedStops > 0;
  const hoursWorked = totalMinutes > 0
    ? `${Math.floor(totalMinutes / 60)} sa ${totalMinutes % 60} dk`
    : null;
  const workedLabel = hoursWorked ? `${hoursWorked} çalışıldı` : "Henüz çalışma yok";
  const plannedLabel = totalQuestions > 0 ? `${totalQuestions} soru çözüldü` : "İlk durak bekliyor";

  return (
    <Card tone="surface" radius="card" style={{ marginTop: STEP.s2, padding: STEP.s3 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.text2, letterSpacing: 1.8 }}>BU HAFTA</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3 }}>{rangeLabel}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: STEP.s1, marginTop: STEP.s2 }}>
        <Text style={{ fontFamily: "Bricolage_400", fontSize: 52, lineHeight: 52, color: C.text, fontVariant: ["tabular-nums"] }}>
          {completedStops}
        </Text>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text3, paddingBottom: 6 }}>
          / {totalStops} aktif gün
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: C.track }]}>
        <View style={[styles.fill, { backgroundColor: hasWork ? C.accent : C.text5, width: `${Math.round(pct * 100)}%` }]} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s2 }}>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.text3 }}>{workedLabel}</Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.text3 }}>{plannedLabel}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, marginTop: STEP.s3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});
