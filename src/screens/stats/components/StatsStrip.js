import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Kutusuz 4'lu istatistik seridi: Soru, Aktif Gun, Deneme, En Iyi Hafta.
export const StatsStrip = memo(function StatsStrip({ C, questions, activeDays, trialCount, bestWeek }) {
  const cells = [
    { label: "Soru", value: questions || "0" },
    { label: "Aktif gün", value: activeDays || "0" },
    { label: "Deneme", value: trialCount || "0" },
    { label: "En iyi hafta", value: bestWeek || "—" },
  ];

  return (
    <View style={[s.row, { borderColor: C.line }]}>
      {cells.map((c, i) => (
        <View key={c.label} style={[s.cell, i > 0 && { borderLeftWidth: 1, borderLeftColor: C.line }]}>
          <Text style={[TYPOGRAPHY.statSmall, s.num, { color: C.text }]}>{c.value}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: STEP.s4,
  },
  cell: {
    flex: 1,
    paddingVertical: STEP.s2,
    alignItems: "center",
    gap: 2,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
});
