import { View, Text, StyleSheet } from "react-native";

import { Card, Skeleton } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

// "SİLİNECEK": uc gercek sayi. Okunamayan sayi cizilmez.
export function DeleteSummaryCard({ counts, loading }) {
  const C = useC();
  const stats = [
    { key: "days", value: counts?.studyDays, unit: "gün rota" },
    { key: "questions", value: counts?.questionCount, unit: "soru kaydı" },
    { key: "wrong", value: counts?.wrongQuestions, unit: "defter sorusu" },
  ].filter((s) => loading || s.value != null);

  if (!stats.length) return null;

  return (
    <Card radius="sheet" style={[styles.card, { borderColor: C.elev }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>SİLİNECEK</Text>
      <View style={styles.row}>
        {stats.map((s) => (
          <View key={s.key}>
            {loading ? (
              <Skeleton width={48} height={22} />
            ) : (
              <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>{s.value.toLocaleString("tr-TR")}</Text>
            )}
            <Text style={[TYPOGRAPHY.micro, styles.unit, { color: C.text3 }]}>{s.unit}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: STEP.s4 - 4 },
  row: { flexDirection: "row", flexWrap: "wrap", columnGap: STEP.s3 + 2, rowGap: STEP.s2, marginTop: STEP.s2 + 4 },
  unit: { marginTop: STEP.s1 - 3 },
});
