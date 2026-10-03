import { StyleSheet, Text, View } from "react-native";

import { CountUpText } from "../../../components/design/CountUpText";
import { LiveFlame } from "../../../components/streak/LiveFlame";
import { useWeekRhythm } from "../../../hooks/useWeekRhythm";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

const DAY = ["P", "S", "Ç", "P", "C", "C", "P"];

// Takvimin EN USTU, kutusuz (Ders analizi dili): canli alev + buyuk seri
// sayisi, altinda haftanin 7 gunluk seridi, tek satir baglam. Sayi metin
// renginde, yalniz alev turuncu (2 Ekim karari). Seri yoksa gosterilmez.
export function CalendarStreakHero({ streak = 0, longest = 0, C }) {
  const rhythm = useWeekRhythm();
  if (!(streak > 0)) return null;
  const best = Math.max(longest, streak);
  return (
    <View style={s.wrap} accessible accessibilityLabel={`${streak} günlük seri. En uzun ${best} gün. ${rhythm.text}.`}>
      <View style={s.head}>
        <LiveFlame size={64} />
        <View>
          <CountUpText value={streak} style={[TYPOGRAPHY.heroNumber, s.num, { color: C.text }]} />
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text2 }]}>günlük seri</Text>
        </View>
      </View>

      <View style={s.week}>
        {(rhythm.week || []).map((d, i) => (
          <View key={d.key} style={s.day}>
            <View
              style={[
                s.dot,
                d.done && { backgroundColor: C.flame },
                !d.done && d.today && { borderWidth: 1.5, borderColor: C.flame },
                !d.done && !d.today && !d.future && { backgroundColor: C.text5 },
                d.future && { borderWidth: 1, borderColor: C.line },
              ]}
            />
            <Text style={[TYPOGRAPHY.micro, { color: d.today ? C.text : C.text3 }]}>{DAY[i]}</Text>
          </View>
        ))}
      </View>

      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
        {best > streak ? `En uzun ${best} gün · ${rhythm.text}` : `En uzun serin bu · ${rhythm.text}`}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, gap: STEP.s2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  num: { fontSize: 56, lineHeight: 60 },
  week: { flexDirection: "row", justifyContent: "space-between", maxWidth: 300 },
  day: { alignItems: "center", gap: 6, minWidth: 28 },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
