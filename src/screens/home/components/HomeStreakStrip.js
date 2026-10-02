import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { Press } from "../../../components/design/Press";
import { StreakDots } from "../../../components/streak/StreakDots";
import { StreakSheet } from "../../../components/streak/StreakSheet";
import { FlameBadge } from "../../../components/streak/FlameBadge";
import { useC } from "../../../contexts/ThemeContext";
import { useStreakWeek } from "../../../hooks/useStreakWeek";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ana sayfa SERI SERIDI: haftanin yedi gunu + seri sayisi + ne yapilacagini
// soyleyen tek cumle. Kutusuz. Dokununca seri paneli acilir.
export function HomeStreakStrip() {
  const C = useC();
  const week = useStreakWeek();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Press
        haptic="tap"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${week.value} günlük seri. ${week.line} Ayrıntı için dokun.`}
        style={s.wrap}
      >
        {/* Alev + seri sayisi one cikar; hafta noktalari altta, calisilan
            gunlerde kucuk alevle. */}
        <View style={s.head}>
          <FlameBadge value={week.value} size={46} />
          <View style={s.headText}>
            <View style={s.count}>
              <CountUpText value={week.value} style={[TYPOGRAPHY.statCount, { color: week.value > 0 ? C.accentText : C.text3 }]} />
              <Text style={[TYPOGRAPHY.metaSemiBold, s.unit, { color: C.text2 }]}>günlük seri</Text>
            </View>
            <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]} numberOfLines={2}>{week.line}</Text>
          </View>
        </View>
        <View style={s.row}>
          <StreakDots days={week.days} size={16} flame settle />
        </View>
      </Press>
      <StreakSheet visible={open} onClose={() => setOpen(false)} week={week} />
    </>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s2, gap: STEP.s2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  headText: { flex: 1, minWidth: 0 },
  row: { flexDirection: "row" },
  count: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  unit: { paddingBottom: 3 },
});
