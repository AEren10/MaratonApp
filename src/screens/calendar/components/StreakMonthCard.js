import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";
import { getNextMilestone } from "../../../lib/streakMilestones";
import { MONTHS_TR } from "../../../lib/trWords";
import { selectStreak } from "../../../store/slices/studyLogSlice";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const MONTH_LOCATIVES = [
  "Ocak'ta", "Şubat'ta", "Mart'ta", "Nisan'da", "Mayıs'ta", "Haziran'da",
  "Temmuz'da", "Ağustos'ta", "Eylül'de", "Ekim'de", "Kasım'da", "Aralık'ta",
];

function Bar({ ratio, C }) {
  return (
    <View style={[s.track, { backgroundColor: C.track }]}>
      <View style={[s.fill, { width: `${Math.round(Math.min(1, ratio) * 100)}%`, backgroundColor: C.accent }]} />
    </View>
  );
}

// Ay karti: var olan calismayi soyleyen sakin motivasyon ve kilometre tasi.
function StreakMonthCard({ monthDate, stats }) {
  const C = useC();
  const streak = useSelector(selectStreak) || 0;
  const next = getNextMilestone(streak);

  const monthIdx = monthDate.getMonth();
  const locative = MONTH_LOCATIVES[monthIdx] || `${MONTHS_TR[monthIdx]}'de`;
  const totalWorkedDays = (stats?.goalDays || 0) + (stats?.keptDays || 0);
  const questions = stats?.questions || 0;

  const summaryText = totalWorkedDays > 0
    ? `${locative} ${totalWorkedDays} gün çalıştın · ${formatNumber(questions)} soru`
    : `${locative} henüz çalışma kaydı yok`;

  return (
    <>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>
          {MONTHS_TR[monthIdx].toLocaleUpperCase("tr-TR")} ÖZETİ
        </Text>
        <Text style={[TYPOGRAPHY.subheading, s.summary, { color: C.text }]}>
          {summaryText}
        </Text>
        {totalWorkedDays > 0 ? (
          <View style={s.barRow}>
            <Bar ratio={stats.goalRatio} C={C} />
            <Text style={[TYPOGRAPHY.caption, s.num, { color: C.text3 }]}>
              {stats.goalDays > 0 ? `${stats.goalDays} gün hedef tuttu` : `${totalWorkedDays} gün seri sürdü`}
            </Text>
          </View>
        ) : null}
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
  summary: { marginTop: STEP.s2, letterSpacing: -0.4 },
  barRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s3 },
  track: { flex: 1, height: 4, borderRadius: HAIR, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  milestone: { marginTop: STEP.s2, paddingVertical: STEP.s3 - 2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  mHead: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  mBar: { flexDirection: "row", marginTop: STEP.s2 + 2 },
  flex: { flex: 1 },
});
