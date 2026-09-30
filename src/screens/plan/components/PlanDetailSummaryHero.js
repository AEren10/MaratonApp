import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatMinutes } from "../usePlanDetailViewModel";
import { PlanDetailSubjectChips } from "./PlanDetailSubjectChips";

export function PlanDetailSummaryHero({
  C,
  plannedMinutes = 0,
  doneMinutes = 0,
  doneCount = 0,
  totalCount = 0,
  tasks = [],
}) {
  const pct = totalCount > 0 ? Math.min(100, Math.round((doneCount / totalCount) * 100)) : 0;

  return (
    <View style={s.card}>
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

      <PlanDetailSubjectChips C={C} tasks={tasks} />
    </View>
  );
}

const s = StyleSheet.create({
  // Kutusuz (kullanici, 30 Eylul): ilerleme zeminde durur, kart icinde kart yok.
  card: {
    paddingVertical: STEP.s2,
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
});
