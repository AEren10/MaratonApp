import { StyleSheet, Text, View } from "react-native";

import { BottomSheet } from "../design/BottomSheet";
import { useC } from "../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";
import { StreakDots } from "./StreakDots";

// Seri paneli: buyuk sayi + tek cumle + hafta + iki kutusuz serit
// (Ders analizi deseni). Kural metni seriyi neyin saydigini acikca soyler.
export function StreakSheet({ visible, onClose, week }) {
  const C = useC();
  if (!week) return null;
  const rows = [
    ["En uzun seri", `${week.longest} gün`],
    ["Joker", week.freeze > 0 ? "Hazır" : "Kullanıldı"],
  ];
  return (
    <BottomSheet visible={visible} onClose={onClose} style={s.sheet}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>SERİ</Text>
      <View style={s.hero}>
        <Text style={[TYPOGRAPHY.statHero, { color: C.text }]}>{week.value}</Text>
        <Text style={[TYPOGRAPHY.statSideUnit, s.unit, { color: C.text2 }]}>gün üst üste</Text>
      </View>
      <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>{week.line}</Text>

      <View style={s.week}>
        <StreakDots days={week.days} size={14} />
      </View>

      {rows.map(([k, v]) => (
        <View key={k} style={[s.row, { borderBottomColor: C.line }]}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text2 }]}>{k}</Text>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{v}</Text>
        </View>
      ))}
      <Text style={[TYPOGRAPHY.caption, s.note, { color: C.text3 }]}>
        {`${week.jokerLine} Bir durak ya da bir çalışma kaydı o günü sayar.`}
      </Text>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  sheet: { borderRadius: SHAPE.sheet, padding: STEP.s3, gap: STEP.s1 },
  hero: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1, marginTop: STEP.s1 },
  unit: { paddingBottom: STEP.s2 },
  week: { flexDirection: "row", marginVertical: STEP.s3 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 44, borderBottomWidth: 1 },
  note: { marginTop: STEP.s2 },
});
