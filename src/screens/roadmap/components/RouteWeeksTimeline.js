import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { RouteWeekRow } from "./RouteWeekRow";

const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function formatWeekRange(weekStart) {
  if (!weekStart) return "";
  const start = new Date(weekStart);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 6 * 86400000);
  const sm = TR_MONTHS[start.getMonth()];
  const em = TR_MONTHS[end.getMonth()];
  if (sm === em) {
    return `${start.getDate()} – ${end.getDate()} ${sm}`;
  }
  return `${start.getDate()} ${sm} – ${end.getDate()} ${em}`;
}

export function RouteWeeksTimeline({ C, weeks = [] }) {
  const displayWeeks = (weeks || []).slice(0, 4);
  if (!displayWeeks.length) return null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, s.sectionLabel, { color: C.text3 }]}>HAFTALARA GÖRE YOL</Text>
      <View style={s.timeline}>
        {displayWeeks.map((w, index) => (
          <RouteWeekRow
            key={w.weekStart || index}
            C={C}
            week={w}
            index={index}
            isFirst={index === 0}
            isLast={index === displayWeeks.length - 1}
            rangeLabel={formatWeekRange(w.weekStart)}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s4,
  },
  sectionLabel: {
    marginBottom: STEP.s2,
  },
  timeline: {
    gap: STEP.s1,
  },
});
