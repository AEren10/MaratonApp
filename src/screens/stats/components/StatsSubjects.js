import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { getSubjectLabel } from "../../../themes/subjects";
import { subjectPaletteKey } from "../../../themes/subjectPalette";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, fmtInt } from "../statsFormat";

// Derslere gore soru dagilimi: en coktan aza, oransal serit.
export const StatsSubjects = memo(function StatsSubjects({ C, subjects = [] }) {
  const rows = [...subjects].filter((r) => r.questions > 0 || r.minutes > 0).sort((a, b) => b.questions - a.questions).slice(0, 8);
  if (!rows.length) return null;
  const peak = Math.max(...rows.map((r) => r.questions), 1);
  return (
    <View style={s.list}>
      {rows.map((r) => (
        <View key={r.subject} style={s.row}>
          <View style={s.head}>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{getSubjectLabel(r.subject)}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${fmtInt(r.questions)} soru · ${fmtHours(r.minutes)} sa`}</Text>
          </View>
          <View style={[s.track, { backgroundColor: C.track }]}>
            <View style={[s.fill, { width: `${Math.max(2, (r.questions / peak) * 100)}%`, backgroundColor: C.subjects?.[subjectPaletteKey(r.subject)] || C.accent }]} />
          </View>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  list: { gap: STEP.s2, marginTop: STEP.s2 },
  row: { gap: 6 },
  head: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
});
