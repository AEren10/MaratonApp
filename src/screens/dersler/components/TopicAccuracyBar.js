import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function TopicAccuracyBar({ C, accuracy, correctCount, totalQuestions }) {
  if (accuracy == null || !totalQuestions || totalQuestions <= 0) return null;

  const tone = accuracy >= 70 ? C.up : accuracy >= 45 ? C.warn : C.down;
  const pct = Math.max(0, Math.min(100, accuracy));

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={s.headerRow}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>DOĞRULUK ORANI</Text>
        <Text style={[TYPOGRAPHY.tableValue, { color: tone }]}>
          {`%${accuracy} · ${correctCount}/${totalQuestions} doğru`}
        </Text>
      </View>
      <View style={[s.track, { backgroundColor: C.track }]}>
        <View style={[s.fill, { width: `${pct}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    marginTop: STEP.s3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: STEP.s2,
  },
  track: {
    height: 6,
    borderRadius: SHAPE.chip / 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: SHAPE.chip / 2,
  },
});
