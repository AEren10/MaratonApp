import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { GrowBar } from "../../../components/design/GrowBar";

const qOf = (m) => Number(m.weekly_questions ?? m.questions ?? 0) || 0;

// Grubun bu hafta birlikte cozdugu soru: zeminsiz tek serit (9 Ekim). Eskiden
// buyuk gri kart yer kapliyordu; sahnenin yildizi artik lider (LeaderSpotlight).
export function GroupWeekHero({ group, members }) {
  const C = useC();
  const fromBoard = members.reduce((sum, m) => sum + qOf(m), 0);
  const total = Math.max(fromBoard, Number(group.weekly_questions ?? group.weeklyQuestions ?? 0) || 0);
  const target = Number(group.weekly_target ?? group.weeklyTarget ?? 0) || 0;
  const share = target > 0 ? Math.min(1, total / target) : 0;

  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>BU HAFTA BİRLİKTE</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>
          {total}
          <Text style={{ color: C.text3 }}>{target > 0 ? ` / ${target} soru` : " soru"}</Text>
        </Text>
      </View>
      {target > 0 ? (
        <GrowBar value={share} color={share >= 1 ? C.up : C.accent} track={C.track} height={4} delay={250} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s1, marginBottom: STEP.s3 },
  row: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
});
