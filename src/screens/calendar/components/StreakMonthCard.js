import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";

import { useC } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../lib/format";
import { getNextMilestone } from "../../../lib/streakMilestones";
import { MONTHS_TR } from "../../../lib/trWords";
import { selectStreak } from "../../../store/slices/studyLogSlice";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";

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
// Ayin gecen gunu: bu ay bugune kadar, gecmis ay tum ay, gelecek ay 0.
function elapsedDays(monthDate, now = new Date()) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const idx = y * 12 + m;
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  if (idx > nowIdx) return 0;
  if (idx < nowIdx) return new Date(y, m + 1, 0).getDate();
  return now.getDate();
}

function StreakMonthCard({ monthDate, stats, onPress }) {
  const C = useC();
  const streak = useSelector(selectStreak) || 0;
  const next = getNextMilestone(streak);

  const monthIdx = monthDate.getMonth();
  const locative = MONTH_LOCATIVES[monthIdx] || `${MONTHS_TR[monthIdx]}'de`;
  const totalWorkedDays = (stats?.goalDays || 0) + (stats?.keptDays || 0);
  const questions = stats?.questions || 0;
  // Cubuk eskiden hedef tutulan gun oranini cizerdi; hedef hic tutmayan
  // kullanicida bos kaliyordu. Ayin gecen gunlerinin kacinda calisildi.
  const elapsed = elapsedDays(monthDate);

  const summaryText = totalWorkedDays > 0
    ? `${locative} ${totalWorkedDays} gün çalıştın · ${formatNumber(questions)} soru`
    : `${locative} henüz çalışma kaydı yok`;

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Press
        haptic="tap"
        onPress={onPress}
        disabled={!onPress}
        accessibilityLabel={`${MONTHS_TR[monthIdx]} özetini aç`}
        style={s.topPress}
      >
        <View style={s.headRow}>
          <Text style={[TYPOGRAPHY.label, s.flex, { color: C.text3 }]}>
            {MONTHS_TR[monthIdx].toLocaleUpperCase("tr-TR")} ÖZETİ
          </Text>
          {onPress ? <Icon name="chevR" size={16} color={C.text3} /> : null}
        </View>
        <Text style={[TYPOGRAPHY.subheading, s.summary, { color: C.text }]}>
          {summaryText}
        </Text>
        {totalWorkedDays > 0 ? (
          <View style={s.barRow}>
            <Bar ratio={elapsed > 0 ? totalWorkedDays / elapsed : 0} C={C} />
            <Text style={[TYPOGRAPHY.caption, s.num, { color: C.text3 }]}>
              {elapsed > 0 ? `${totalWorkedDays}/${elapsed} gün aktif` : `${totalWorkedDays} gün aktif`}
              {stats.goalDays > 0 ? ` · ${stats.goalDays} hedef` : ""}
            </Text>
          </View>
        ) : null}
      </Press>
      {next ? (
        <View style={[s.milestone, { borderTopWidth: 1, borderTopColor: C.line }]}>
          <View style={s.mHead}>
            <Text style={[TYPOGRAPHY.tableName, s.flex, { color: C.text }]}>{`${next.day} gün kilometre taşı`}</Text>
            <Text style={[TYPOGRAPHY.metaSemiBold, s.num, { color: C.accentBright }]}>{`${next.daysLeft} gün`}</Text>
          </View>
          <View style={s.mBar}><Bar ratio={streak / next.day} C={C} /></View>
        </View>
      ) : null}
    </View>
  );
}

export default memo(StreakMonthCard);

const s = StyleSheet.create({
  card: {
    marginTop: STEP.s4 - 4,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    overflow: "hidden",
  },
  topPress: {
    padding: STEP.s3,
  },
  summary: { marginTop: STEP.s2, letterSpacing: -0.4 },
  barRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s3 },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  num: { letterSpacing: 0, fontVariant: ["tabular-nums"] },
  milestone: {
    paddingVertical: STEP.s2 + 2,
    paddingHorizontal: STEP.s3,
  },
  mHead: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  mBar: { flexDirection: "row", marginTop: STEP.s2 },
  flex: { flex: 1 },
  headRow: { flexDirection: "row", alignItems: "center" },
});
