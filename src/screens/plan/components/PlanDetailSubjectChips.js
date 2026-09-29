import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getSubjectByKey } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function fmt(minutes) {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

export function PlanDetailSubjectChips({ C, tasks = [] }) {
  const subjects = Object.values(
    tasks.reduce((acc, task) => {
      const key = task.s?.key || "genel";
      const prev = acc[key] || { key, minutes: 0 };
      prev.minutes += task.minutes ?? (task.q || 0) * 2;
      acc[key] = prev;
      return acc;
    }, {})
  );

  if (subjects.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chipsRow}
      style={s.chipsScroll}
    >
      {subjects.map((sub) => (
        <View
          key={sub.key}
          style={[s.chip, { backgroundColor: C.void, borderColor: C.elev }]}
        >
          <View style={[s.dot, { backgroundColor: subjectColorOf(C, sub.key) }]} />
          <Text style={[TYPOGRAPHY.tableHead, s.chipText, { color: C.text2 }]}>
            {getSubjectByKey(sub.key)?.label || sub.key} · {fmt(sub.minutes)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  chipsScroll: {
    marginTop: STEP.s2 + STEP.s1 / 2,
    marginHorizontal: -STEP.s1,
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingHorizontal: STEP.s1,
  },
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
});
