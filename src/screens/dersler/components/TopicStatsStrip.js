import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Kutusuz 4'lu istatistik seridi: Cozulen, Sure, Defterde, Son calisma.
export const TopicStatsStrip = memo(function TopicStatsStrip({ C, solved, duration, wrongCount, lastStudy }) {
  const cells = [
    { label: "Çözülen", value: solved > 0 ? String(solved) : "—" },
    { label: "Süre", value: duration || "—" },
    { label: "Defterde", value: wrongCount > 0 ? String(wrongCount) : "—" },
    { label: "Son çalışma", value: lastStudy || "—" },
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
