import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { FlameBadge } from "../../../components/streak/FlameBadge";
import { StreakSheet } from "../../../components/streak/StreakSheet";
import { useC } from "../../../contexts/ThemeContext";
import { useStreakWeek } from "../../../hooks/useStreakWeek";
import { useWeekRhythm } from "../../../hooks/useWeekRhythm";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Ana sayfa SERI SATIRI: animasyonlu turuncu alev + sayarak gelen seri +
// haftalik ritim. Tek satir yuksekliginde (buyuk serit ana sayfayi
// sikistiriyordu, kullanici 2 Ekim); dokununca ortada seri karti acilir.
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
        <FlameBadge value={week.value} size={38} />
        <View style={s.text}>
          <View style={s.count}>
            {lit ? (
              <>
                <CountUpText value={week.value} style={[TYPOGRAPHY.statMedium, { color: C.flame }]} />
                <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>günlük seri</Text>
              </>
            ) : (
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Bugün seri başlar</Text>
            )}
          </View>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>{rhythm.text}</Text>
        </View>
        <Icon name="chevR" size={14} color={C.text3} />
      </Press>
      <StreakSheet visible={open} onClose={() => setOpen(false)} week={week} />
    </>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin, marginTop: STEP.s2 },
  text: { flex: 1, minWidth: 0 },
  count: { flexDirection: "row", alignItems: "baseline", gap: 6 },
});
