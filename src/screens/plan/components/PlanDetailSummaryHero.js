import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { getSubjectByKey } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatMinutes } from "../usePlanDetailViewModel";

function fmt(minutes) {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

export function PlanDetailSummaryHero({
  C,
  plannedMinutes = 0,
  doneMinutes = 0,
  doneCount = 0,
  totalCount = 0,
  tasks = [],
}) {
  const pct = totalCount > 0 ? Math.min(100, Math.round((doneCount / totalCount) * 100)) : 0;

  const subjects = Object.values(
    tasks.reduce((acc, task) => {
      const key = task.s?.key || "genel";
      const prev = acc[key] || { key, minutes: 0 };
      prev.minutes += task.minutes ?? (task.q || 0) * 2;
      acc[key] = prev;
      return acc;
    }, {})
  );

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={s.topRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>GÜNÜN İLERLEMESİ</Text>
        <View style={[s.badge, { backgroundColor: C.void, borderColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.tableHead, s.badgeText, { color: C.accentBright }]}>
            {`${doneCount}/${totalCount} DURAK`}
          </Text>
        </View>
      </View>

      <View style={s.valueRow}>
        <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>
          {formatMinutes(doneMinutes)}
        </Text>
        <Text style={[TYPOGRAPHY.bodyMedium, s.slash, { color: C.text3 }]}>
          /
        </Text>
        <Text style={[TYPOGRAPHY.bodyMedium, s.plannedText, { color: C.text2 }]}>
          {`${formatMinutes(plannedMinutes)} planlanan`}
        </Text>
      </View>

      <View style={[s.track, { backgroundColor: C.track }]}>
        <View
          style={[
            s.fill,
            {
              width: `${pct}%`,
              backgroundColor: pct >= 100 ? C.up : C.accent,
            },
          ]}
        />
      </View>

      {subjects.length > 0 ? (
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
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    padding: STEP.s3,
    marginBottom: STEP.s2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: STEP.s1,
    paddingVertical: STEP.s1 / 4,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  badgeText: {
    letterSpacing: 0.6,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s1,
    marginTop: STEP.s2,
    marginBottom: STEP.s2,
  },
  slash: {
    marginHorizontal: STEP.s1 / 2,
  },
  plannedText: {
    letterSpacing: 0,
  },
  track: {
    height: 4,
    borderRadius: SHAPE.chip / 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: SHAPE.chip / 2,
  },
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
