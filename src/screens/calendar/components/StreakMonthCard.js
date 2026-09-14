import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";
import { getNextMilestone } from "../../../lib/streakMilestones";
import { MONTHS_TR } from "../../../lib/trWords";
import { selectStreak } from "../../../store/slices/studyLogSlice";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function Bar({ ratio, C }) {
  return (
    <View style={[s.track, { backgroundColor: C.track }]}>
      <View style={[s.fill, { width: `${Math.round(Math.min(1, ratio) * 100)}%`, backgroundColor: C.accent }]} />
    </View>
  );
}

// Ay karti (hedef tuttu / seri surdu, soru) + sonraki seri kilometre tasi.
function StreakMonthCard({ monthDate, stats }) {
  const C = useC();
  const streak = useSelector(selectStreak) || 0;
  const next = getNextMilestone(streak);

  return (
    <>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{MONTHS_TR[monthDate.getMonth()].toLocaleUpperCase("tr-TR")}</Text>
        <View style={s.stats}>
          {[[stats.goalDays, "hedef tuttu"], [stats.keptDays, "seri sürdü"]].map(([v, label]) => (
            <View key={label}>
              <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{v}</Text>
              <Text style={[TYPOGRAPHY.micro, s.sub, { color: C.text3 }]}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={s.barRow}>
          <Bar ratio={stats.goalRatio} C={C} />
          <Text style={[TYPOGRAPHY.tableHead, s.num, { color: C.text3 }]}>{`${formatNumber(stats.questions)} soru`}</Text>
        </View>
      </View>
      {next ? (
        <View style={[s.milestone, { backgroundColor: C.surface, borderColor: C.elev }]}>
          <View style={s.mHead}>
            <Text style={[TYPOGRAPHY.tableName, s.flex, { color: C.text }]}>{`${next.day} gün kilometre taşı`}</Text>
            <Text style={[TYPOGRAPHY.metaSemiBold, s.num, { color: C.accentBright }]}>{`${next.daysLeft} gün`}</Text>
          </View>
          <View style={s.mBar}><Bar ratio={streak / next.day} C={C} /></View>
        </View>
      ) : null}
    </>
  );
}

export default memo(StreakMonthCard);

const HAIR = 1;

const s = StyleSheet.create({
  card: { marginTop: STEP.s4 - 4, padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  stats: { flexDirection: "row", gap: STEP.s3 + 4, marginTop: STEP.s3 - 4 },
  sub: { marginTop: STEP.s1 / 2 },
  barRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s3 },
  track: { flex: 1, height: 4, borderRadius: HAIR, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  milestone: { marginTop: STEP.s2, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  mHead: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  mBar: { flexDirection: "row", marginTop: STEP.s2 + 2 },
  flex: { flex: 1 },
});
