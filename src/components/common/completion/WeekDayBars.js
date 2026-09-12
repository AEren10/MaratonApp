import { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const MAX_H = 72;
const MIN_H = 6;
const DAY_NAMES = ["pazartesi", "salı", "çarşamba", "perşembe", "cuma", "cumartesi", "pazar"];

function buildNote(days, peak) {
  const worked = days.map((d, i) => ({ minutes: d.minutes || 0, i })).filter((d) => d.minutes > 0);
  if (worked.length < 2) return "Yükseklik o günün çalışma süresi.";
  const low = worked.reduce((a, b) => (b.minutes < a.minutes ? b : a));
  const high = worked.find((d) => d.minutes === peak);
  if (!high || low.minutes === peak) return "Yükseklik o günün çalışma süresi.";
  return `Yükseklik o günün çalışma süresi. En yoğun gün ${DAY_NAMES[high.i]}, en hafif gün ${DAY_NAMES[low.i]}.`;
}

// "YEDI GUN": yukseklik o gunun calisma suresi. Veri useWeekProgram.days'ten
// gelir (study_logs dakikasi); opaklik da ayni orandan turer.
export const WeekDayBars = memo(function WeekDayBars({ days = [] }) {
  const C = useC();
  if (days.length !== 7) return null;

  const peak = Math.max(...days.map((d) => d.minutes || 0));
  if (peak <= 0) return null;

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>YEDİ GÜN</Text>
      <View style={s.row}>
        {days.map((day) => {
          const ratio = (day.minutes || 0) / peak;
          return (
            <View key={day.key} style={s.col}>
              <View
                style={[
                  s.bar,
                  {
                    height: Math.max(MIN_H, Math.round(MAX_H * ratio)),
                    backgroundColor: day.minutes > 0 ? C.accent : C.track,
                    opacity: day.minutes > 0 ? 0.6 + 0.4 * ratio : 1,
                  },
                ]}
              />
              <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
                {String(day.letter || "").charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={[TYPOGRAPHY.micro, s.note, { color: C.text3 }]}>{buildNote(days, peak)}</Text>
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1, marginTop: STEP.s2, alignItems: "flex-end" },
  col: { flex: 1, alignItems: "center", gap: STEP.s1 },
  bar: { width: "100%", borderRadius: SHAPE.chip },
  note: { marginTop: STEP.s2 },
});
