import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";
import { formatDuration, weekStory } from "../../../../domain/insight/storyLines";
import { getSubjectLabel } from "../../../../themes/subjects";
import { formatInt } from "../../../../domain/summary/summaryFormat";
import { PeriodBarChart } from "./PeriodBarChart";
import { StatsStrip } from "../../../../components/design/StatsStrip";

export function WeekSummaryBody({ data }) {
  const C = useC();
  const curMinutes = data.totals?.minutes || 0;
  const prevMinutes = data.previous?.minutes ?? null;
  const diff = prevMinutes != null ? curMinutes - prevMinutes : null;

  const deltaText = diff != null && diff !== 0
    ? `${diff > 0 ? "+" : "−"}${formatDuration(Math.abs(diff))}`
    : null;
  const deltaColor = diff > 0 ? C.up : diff < 0 ? C.down : C.text3;

  const bySubject = useMemo(
    () =>
      (data.totals?.subjects || []).map((s) => ({
        label: getSubjectLabel(s.key),
        minutes: s.minutes || 0,
      })),
    [data.totals?.subjects]
  );

  const story = useMemo(
    () => weekStory({ minutes: curMinutes, prevMinutes, bySubject }),
    [curMinutes, prevMinutes, bySubject]
  );

  const heroTime = formatDuration(curMinutes);
  const stopsLabel = `${data.totals?.stopsDone || 0}${
    data.totals?.stopsPlanned ? `/${data.totals.stopsPlanned}` : ""
  }`;

  return (
    <View style={s.wrap}>
      <View style={s.header}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
          {data.eyebrow || "HAFTALIK ÇALIŞMA SÜRESİ"}
        </Text>
        <View style={s.heroRow}>
          <Text style={[TYPOGRAPHY.stat, s.num, { color: C.text }]}>{heroTime}</Text>
          {deltaText ? (
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: deltaColor }]}>{deltaText}</Text>
          ) : null}
        </View>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, marginTop: STEP.s1 }]}>{story}</Text>
      </View>

      <PeriodBarChart
        label="GÜNLÜK ÇALIŞMA"
        trailing={heroTime}
        bars={data.chart?.bars}
      />

      <StatsStrip C={C} cells={[
        { value: formatInt(data.totals?.questions || 0), label: "Soru" },
        { value: stopsLabel, label: "Durak" },
        { value: data.totals?.activeDays != null ? `${data.totals.activeDays}/7` : "—", label: "Aktif gün" },
        { value: data.streak > 0 ? `${data.streak} gün` : "—", label: "Seri" },
      ]} style={{ marginTop: STEP.s4, marginHorizontal: STEP.s3 }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingBottom: STEP.s4,
  },
  header: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s2,
    marginTop: STEP.s1,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
});
