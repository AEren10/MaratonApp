import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SectionLabel } from "../../../components/design";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

function InfoRow({ label, value, isLast, C }) {
  return (
    <View style={[s.row, { borderTopColor: C.line }, isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text3, flex: 1 }]}>{label}</Text>
      <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{value}</Text>
    </View>
  );
}

export function TopicInfoList({ C, durationLabel, notebookCount, lastStudyText, routePlace }) {
  const rows = [
    { label: "Çalışılan süre", value: durationLabel },
    { label: "Defterde bekleyen", value: `${notebookCount} soru` },
    { label: "Son çalışma", value: lastStudyText },
    { label: "Rotadaki yeri", value: routePlace || "Rotada planlı değil" },
  ];

  return (
    <View style={s.wrap}>
      <SectionLabel>BU KONUDA</SectionLabel>
      <View style={s.list}>
        {rows.map((r, i) => (
          <InfoRow key={r.label} label={r.label} value={r.value} isLast={i === rows.length - 1} C={C} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s4,
  },
  list: {
    marginTop: STEP.s2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2 + STEP.s1 / 4,
    borderTopWidth: 1,
  },
});
