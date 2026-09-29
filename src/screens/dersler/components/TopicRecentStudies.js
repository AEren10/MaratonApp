import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SectionLabel } from "../../../components/design";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function TopicRecentStudies({ C, items = [] }) {
  if (!items.length) return null;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <SectionLabel style={s.label}>SON ÇALIŞMALAR</SectionLabel>
        <View style={[s.divider, { backgroundColor: C.line }]} />
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>{items.length}</Text>
      </View>

      <View style={[s.list, { borderTopColor: C.line }]}>
        {items.map((log) => {
          const correctText = log.correctCount != null ? ` · ${log.correctCount} doğru` : "";
          const questionsText = log.questionCount > 0 ? `${log.questionCount} soru${correctText}` : null;
          const durationText = log.durationMinutes > 0 ? `${log.durationMinutes} dk` : null;
          const metaRight = [questionsText, durationText].filter(Boolean).join(" · ");

          return (
            <View key={log.id} style={[s.row, { borderBottomColor: C.line }]}>
              <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>{log.dateLabel}</Text>
              <Text style={[TYPOGRAPHY.tableValue, { color: C.text2 }]}>{metaRight}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginBottom: STEP.s2,
  },
  label: {
    marginBottom: STEP.s1 - STEP.s1,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  list: {
    borderTopWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s2 + STEP.s1 / 4,
    borderBottomWidth: 1,
  },
});
