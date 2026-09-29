import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, weekLabel } from "../statsFormat";

const PLOT_H = 110;

// Son 8 hafta: cubuk yuksekligi soru, altinda saat. En iyi hafta vurgulu.
export const StatsWeeks = memo(function StatsWeeks({ C, weeks = [], bestWeekStart }) {
  if (!weeks.length) return null;
  const peak = Math.max(...weeks.map((w) => w.questions), 1);
  return (
    <View style={s.row}>
      {weeks.map((w) => {
        const best = bestWeekStart && w.weekStart === bestWeekStart;
        const h = w.questions > 0 ? Math.max(4, (w.questions / peak) * PLOT_H) : 3;
        return (
          <View key={w.weekStart} style={s.col}>
            <Text style={[TYPOGRAPHY.meta, { color: best ? C.accentBright : C.text3 }]}>{w.questions || ""}</Text>
            <View style={[s.bar, { height: h, backgroundColor: w.questions > 0 ? (best ? C.accent : C.accentDeep) : C.track }]} />
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{weekLabel(w.weekStart)}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{w.minutes ? `${fmtHours(w.minutes)}s` : " "}</Text>
          </View>
        );
      })}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1, marginTop: STEP.s2 },
  col: { flex: 1, alignItems: "center", gap: 4 },
  bar: { width: "70%", borderRadius: SHAPE.chip / 2 },
});
