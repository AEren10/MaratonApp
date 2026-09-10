import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

const DAY_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

// Son 7 gunun kucuk seridi: her kutuda gun kisaltmasi, o gunku soru sayisi
// ve gunluk hedefe ulasildi mi noktasi. Tasarim AKIS 14 · Son Hafta.
export function HomeHeroWeekStrip({ dailyCounts = [], dailyGoal = 0 }) {
  const C = useC();
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <View style={s.row}>
      {DAY_LABELS.map((label, i) => {
        const count = dailyCounts[i] || 0;
        const isToday = i === todayIdx;
        const met = dailyGoal > 0 && count >= dailyGoal;
        return (
          <View
            key={label + i}
            style={[
              s.cell,
              {
                backgroundColor: isToday ? C.brandTint : C.void,
                borderColor: isToday ? C.accent : C.elev,
              },
            ]}
          >
            <Text style={[TYPOGRAPHY.micro, { color: isToday ? C.accentBright : C.text3 }]}>
              {label}
            </Text>
            <Text style={[TYPOGRAPHY.captionMedium, { color: isToday ? C.text : C.text2 }]}>
              {count}
            </Text>
            <View style={[s.dot, { backgroundColor: met ? C.accent : C.line }]} />
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 5 },
  cell: {
    flex: 1,
    paddingVertical: STEP.s1 + 5,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 5, height: 5, borderRadius: 1 },
});
