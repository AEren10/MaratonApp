import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SHAPE, TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { getSubjectByKey } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";

function fmt(minutes) {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

export function PlanDetailSubjects({ C, tasks = [] }) {
  const subjects = Object.values(tasks.reduce((acc, task) => {
    const key = task.s?.key || "genel";
    const prev = acc[key] || { key, minutes: 0 };
    prev.minutes += task.minutes ?? ((task.q || 0) * 2);
    acc[key] = prev;
    return acc;
  }, {})).slice(0, 4);

  if (subjects.length === 0) return null;

  return (
    <View style={s.row}>
      {subjects.map((sub) => (
        <View
          key={sub.key}
          style={[s.chip, { backgroundColor: C.surface, borderColor: C.elev }]}
        >
          <View style={[s.dot, { backgroundColor: subjectColorOf(C, sub.key) }]} />
          <Text style={[TYPOGRAPHY.tableHead, s.chipText, { color: C.text2 }]}>
            {getSubjectByKey(sub.key)?.label || sub.key} · {fmt(sub.minutes)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1, marginTop: STEP.s2 },
  chip: {
    height: 28,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  chipText: {
    letterSpacing: 0,
    textTransform: "none",
  },
  dot: { width: 6, height: 6, borderRadius: 1 },
});
