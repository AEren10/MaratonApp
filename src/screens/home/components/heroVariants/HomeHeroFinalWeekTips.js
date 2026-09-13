import { View, Text, StyleSheet } from "react-native";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";
import { WEEKDAYS } from "../../../../domain/exam/examRehearsal";

// "HATIRLATMALAR" — tasarimin uc satiri. Gun adlari sabit degil, sinav
// tarihinden turetilir: arife gunu dinlenme, bir onceki aksam belgeler.
function tips(examDate) {
  const exam = examDate instanceof Date ? examDate : new Date(examDate);
  const valid = !Number.isNaN(exam.getTime());
  const dayName = (offset) => WEEKDAYS[(exam.getDay() + 7 - offset) % 7];
  return [
    { text: "Sınav saatinde uyanmaya bu hafta başla", tone: "accent" },
    valid ? { text: `${dayName(1)} günü çalışma yok, sadece dinlenme`, tone: "warn" } : null,
    valid ? { text: `Belgelerini ${dayName(2).toLowerCase()} akşamı hazırla`, tone: "plain" } : null,
  ].filter(Boolean);
}

export function HomeHeroFinalWeekTips({ examDate }) {
  const C = useC();
  const tone = { accent: C.accent, warn: C.warn, plain: C.text5 };
  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>HATIRLATMALAR</Text>
      <View style={s.list}>
        {tips(examDate).map((t) => (
          <View key={t.text} style={[s.row, { backgroundColor: C.void, borderColor: C.elev }]}>
            <View style={[s.dot, { backgroundColor: tone[t.tone] }]} />
            <Text style={[TYPOGRAPHY.meta, s.text, { color: C.text2 }]}>{t.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { marginTop: STEP.s2 + 2, gap: STEP.s1 + 2 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 13,
    paddingVertical: 15, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 1 },
  text: { flex: 1 },
});
