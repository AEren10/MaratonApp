import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { Icon } from "../../../components/design/Icon";
import { useWeekRhythm } from "../../../hooks/useWeekRhythm";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Takvimin EN USTU: alev + sayarak artan seri sayisi + tek satir baglam
// (en uzun seri, haftalik ritim). Kizil halka ve kizil sayi kalkti
// (kullanici, 2 Ekim): sayi metin renginde, yalniz alev turuncu.
// Seri yoksa gosterilmez (bos bir "0" tesvik degil, ceza gibi okunur).
export function CalendarStreakHero({ streak = 0, longest = 0, C }) {
  const rhythm = useWeekRhythm();
  if (!(streak > 0)) return null;
  const best = Math.max(longest, streak);
  return (
    <View style={s.wrap} accessible accessibilityLabel={`${streak} günlük seri. En uzun ${best} gün. ${rhythm.text}.`}>
      <View style={s.head}>
        <Icon name="flame" size={28} color={C.flame} fill={C.flame} />
        <CountUpText value={streak} style={[TYPOGRAPHY.stat, { color: C.text }]} />
        <Text style={[TYPOGRAPHY.bodySemiBold, s.unit, { color: C.text2 }]}>günlük seri</Text>
      </View>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
        {best > streak ? `En uzun ${best} gün · ${rhythm.text}` : `En uzun serin bu · ${rhythm.text}`}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, gap: STEP.s1 / 2 },
  head: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1 },
  unit: { paddingBottom: STEP.s1 + 2 },
});
