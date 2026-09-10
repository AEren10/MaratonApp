import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const QUESTIONS = [
  "Hangi sınava hazırlanıyorsun",
  "Hedef netin kaç",
  "Şu an neredesin",
];

// Karşılama ekranındaki "DÖRT SORU · 90 SANİYE" önizleme listesi.
export function QuestionPreviewList() {
  const C = useC();
  return (
    <View style={{ paddingTop: STEP.s1 }}>
      <View style={styles.headerRow}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2, letterSpacing: 2 }]}>
          DÖRT SORU · 90 SANİYE
        </Text>
        <View style={[styles.rule, { backgroundColor: C.line }]} />
      </View>
      <View>
        {QUESTIONS.map((q, i) => (
          <View key={q} style={[styles.row, { borderTopColor: C.line }]}>
            <Text style={[TYPOGRAPHY.topicName, { color: C.text3, width: 22 }]}>{i + 1}</Text>
            <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, flex: 1 }]}>{q}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, paddingBottom: STEP.s1 },
  rule: { flex: 1, height: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: 14, borderTopWidth: 1 },
});
