import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Kutusuz 4'lu istatistik seridi: Soru, Durak, Aktif gun, Seri.
export const SummaryStatsStrip = memo(function SummaryStatsStrip({ C, questions, stops, activeDays, streak }) {
  const cells = [
    { label: "Soru", value: questions || "0" },
    { label: "Durak", value: stops || "0" },
    { label: "Aktif gün", value: activeDays != null ? `${activeDays}/7` : "—" },
    { label: "Seri", value: streak > 0 ? `${streak} gün` : "—" },
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
    marginHorizontal: STEP.s3,
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
