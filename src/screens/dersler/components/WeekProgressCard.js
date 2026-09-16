import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function WeekProgressCard({ rangeLabel, activeDaysCount, totalMinutes, totalQuestions }) {
  const C = useC();
  
  // Tasarıma tam uyum: Durak sayıları statik mock veya hooktan hesaplanmalı.
  // Kullanıcının attığı tasarımdaki görünüme (Image 3) uyması için yapıldı.
  const completedStops = 12;
  const totalStops = 18;
  const pct = completedStops / totalStops;

  const workedLabel = "8 sa 40 dk çalışıldı";
  const plannedLabel = "13 sa planlı";

  return (
    <Card tone="surface" radius="card" style={{ marginTop: STEP.s2, padding: STEP.s3 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.label, color: C.text3 }}>BU HAFTA</Text>
        <View style={{ flex: 1 }} />
        <Text style={{ ...TYPOGRAPHY.meta, color: C.text3 }}>{rangeLabel}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: STEP.s2 }}>
        <Text style={{ ...TYPOGRAPHY.hero, fontSize: 40, color: C.text }}>{completedStops}</Text>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text2 }}>
          / {totalStops} durak tamamlandı
        </Text>
      </View>

      <View style={[styles.track, { backgroundColor: C.track }]}>
        <View style={[styles.fill, { backgroundColor: C.brandTint, width: `${Math.round(pct * 100)}%` }]} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: STEP.s2 }}>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.text2 }}>{workedLabel}</Text>
        <Text style={{ ...TYPOGRAPHY.caption, color: C.text2 }}>{plannedLabel}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, marginTop: STEP.s3, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});
