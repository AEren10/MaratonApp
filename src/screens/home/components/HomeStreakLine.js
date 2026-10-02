import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { StreakSheet } from "../../../components/streak/StreakSheet";
import { useC } from "../../../contexts/ThemeContext";
import { useStreakWeek } from "../../../hooks/useStreakWeek";
import { useWeekRhythm } from "../../../hooks/useWeekRhythm";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ana sayfa SERI SATIRI: alev + seri + haftalik ritim, tek satir. Buyuk
// seri seridi ana sayfayi sikistiriyordu (kullanici, 2 Ekim); hafta
// noktalari ve esik dokununca acilan panelde.
export function HomeStreakLine() {
  const C = useC();
  const week = useStreakWeek();
  const rhythm = useWeekRhythm();
  const [open, setOpen] = useState(false);
  const lit = week.value > 0;

  return (
    <>
      <Press
        haptic="tap"
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${week.value} günlük seri. ${rhythm.text}. Ayrıntı için dokun.`}
        style={s.row}
      >
        <Icon name="flame" size={18} color={lit ? C.flame : C.text3} fill={lit ? C.flame : "none"} />
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>
          {lit ? `${week.value} günlük seri` : "Bugün seri başlar"}
        </Text>
        <View style={[s.dot, { backgroundColor: C.text3 }]} />
        <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text2 }]} numberOfLines={1}>{rhythm.text}</Text>
        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
      <StreakSheet visible={open} onClose={() => setOpen(false)} week={week} />
    </>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, minHeight: CONTROL.tapMin },
  dot: { width: 3, height: 3, borderRadius: 2 },
  flex: { flex: 1 },
});
