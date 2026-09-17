import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
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

  return (
    <View style={s.row}>
      {subjects.map((sub) => (
        <View key={sub.key} style={s.item}>
          <View style={[s.dot, { backgroundColor: subjectColorOf(C, sub.key) }]} />
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
            {getSubjectByKey(sub.key)?.label || sub.key} · {fmt(sub.minutes)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s3, marginTop: STEP.s3 },
  item: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 1 },
});
