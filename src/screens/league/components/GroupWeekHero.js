import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { GrowBar } from "../../../components/design/GrowBar";

const qOf = (m) => Number(m.weekly_questions ?? m.questions ?? 0) || 0;

// Odanin kahraman sayisi: grubun bu hafta birlikte cozdugu soru, ortak
// hedefe ilerleme ve senin payin.
export function GroupWeekHero({ group, members }) {
  const C = useC();
  const fromBoard = members.reduce((sum, m) => sum + qOf(m), 0);
  const total = Math.max(fromBoard, Number(group.weekly_questions ?? group.weeklyQuestions ?? 0) || 0);
  const target = Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0;
  const me = members.find((m) => m.you);
  const mine = me ? qOf(me) : 0;
  const share = target > 0 ? Math.min(1, total / target) : 0;

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU HAFTA BİRLİKTE</Text>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.statLarge, { color: C.text }]}>{total}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{target > 0 ? `/ ${target} soru` : "soru"}</Text>
      </View>
      {target > 0 ? (
        <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} height={5} delay={250} style={s.bar} />
      ) : null}
      <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>
        {me ? `Senin payın ${mine} soru${me.rank ? ` · ${me.rank}. sıradasın` : ""}.` : "Sıralama yüklenince payın burada görünür."}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: SHAPE.card, borderWidth: 1, padding: STEP.s3, gap: STEP.s1, marginBottom: STEP.s2 },
  hero: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 },
  bar: { marginVertical: 4 },
});
