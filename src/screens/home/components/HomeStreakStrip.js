import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { Press } from "../../../components/design/Press";
import { StreakDots } from "../../../components/streak/StreakDots";
import { StreakSheet } from "../../../components/streak/StreakSheet";
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
        <View style={s.row}>
          <StreakDots days={week.days} settle />
          <View style={s.count}>
            <CountUpText value={week.value} style={[TYPOGRAPHY.statSmall, { color: week.value > 0 ? C.text : C.text3 }]} />
            <Text style={[TYPOGRAPHY.meta, s.unit, { color: C.text3 }]}>gün</Text>
          </View>
        </View>
        <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]} numberOfLines={2}>{week.line}</Text>
      </Press>
      <StreakSheet visible={open} onClose={() => setOpen(false)} week={week} />
    </>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s2, gap: STEP.s1 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s3 },
  count: { flexDirection: "row", alignItems: "flex-end", gap: 4, minWidth: 64, justifyContent: "flex-end" },
  unit: { paddingBottom: 4 },
});
