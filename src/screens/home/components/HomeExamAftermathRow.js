import { Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { getExamPhase } from "../../../domain/exam/examPhase";
import { useExamResultEntry } from "../../../hooks/useExamResultEntry";
import { trackButtonTap } from "../../../lib/analytics";
import { Press } from "../../../components/design/Press";

// Sinav sonrasi Ana Sayfa girisi (AKIS 14 · "SINAV SONRASI · 1 / 2").
// Sonuc yoksa "Sınav Sonucu" basligiyla oraya, varsa Tahmin Dogrulugu'na.
// Sinav tarihi gecmediyse hic cizilmez.
export function HomeExamAftermathRow() {
  const C = useC();
  const navigation = useNavigation();
  const { examDate } = useExam();
  const { status, entry } = useExamResultEntry();
  const { daysLeft } = getExamPhase(examDate);

  if (daysLeft == null || daysLeft >= 0 || status === "loading") return null;

  const target = entry ? SCREENS.FORECAST_ACCURACY : SCREENS.EXAM_RESULT;
  const label = entry ? "Tahmin ne kadar tuttu" : "Hazır olduğunda sonucunu gir.";

  return (
    <Press haptic="none"
      onPress={() => {
        trackButtonTap("home_exam_aftermath", { targetScreen: target });
        navigation.navigate(target);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[s.row, { backgroundColor: C.surface, borderColor: C.elev}]}
    >
      <Text style={[TYPOGRAPHY.label, { color: C.accentBright }]}>SINAV BİTTİ</Text>
      <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: C.text }]} numberOfLines={1}>{label}</Text>
      <Icon name="chevR" size={12} color={C.text3} />
    </Press>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    minHeight: CONTROL.tapMin + STEP.s2, marginTop: STEP.s2,
    paddingHorizontal: 18, borderRadius: SHAPE.panel, borderWidth: 1,
  },
  label: { flex: 1 },
});
