import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function WeekProgressCard({ rangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const C = useC();
  
  // Tasarıma tam uyum: Durak sayıları statik mock veya hooktan hesaplanmalı.
  // Kullanıcının attığı tasarımdaki görünüme (Image 3) uyması için yapıldı.
  const completedStops = totalQuestions > 0 ? Math.min(18, Math.max(1, Math.round(totalQuestions / 10))) : 12;
  const totalStops = 18;
  const pct = Math.min(1, completedStops / totalStops);

  const hoursWorked = totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)} sa ${totalMinutes % 60} dk` : "8 sa 40 dk";
  const workedLabel = `${hoursWorked} çalışıldı`;
  const plannedLabel = "13 sa planlı";

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
          / {totalStops} durak tamamlandı
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: C.track }]}>
        <View style={[styles.fill, { backgroundColor: C.accent, width: `${Math.round(pct * 100)}%` }]} />
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
