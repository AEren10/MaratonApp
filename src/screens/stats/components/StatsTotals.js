import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, fmtInt } from "../statsFormat";

// Uc buyuk sayi: toplam soru, toplam saat, aktif gun. Veri yoksa "—".
export const StatsTotals = memo(function StatsTotals({ C, study }) {
  const cells = [
    { label: "soru", value: fmtInt(study?.totalQuestions) },
    { label: "saat", value: fmtHours(study?.totalMinutes) },
    { label: "aktif gün", value: fmtInt(study?.activeDays) },
  ];
  return (
    <View style={s.row}>
      {cells.map((c) => (
        <View key={c.label} style={s.cell}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]} numberOfLines={1} adjustsFontSizeToFit>{c.value}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s2 },
  cell: { flex: 1 },
});
