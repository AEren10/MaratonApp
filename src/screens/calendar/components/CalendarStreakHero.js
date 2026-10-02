import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { FlameBadge } from "../../../components/streak/FlameBadge";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Takvimin EN USTU: alev + sayarak artan buyuk seri sayisi. Seri yoksa
// gosterilmez (bos bir "0" tesvik degil, ceza gibi okunur).
export function CalendarStreakHero({ streak = 0, C }) {
  if (!(streak > 0)) return null;
  return (
    <View style={s.wrap} accessible accessibilityLabel={`${streak} günlük seri`}>
      <FlameBadge value={streak} size={56} />
      <View style={s.count}>
        <CountUpText value={streak} style={[TYPOGRAPHY.statLarge, { color: C.accentText }]} />
        <Text style={[TYPOGRAPHY.bodySemiBold, s.unit, { color: C.text2 }]}>günlük seri</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: STEP.s2, marginTop: STEP.s3 },
  count: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1 },
  unit: { paddingBottom: STEP.s1 + 2 },
});
