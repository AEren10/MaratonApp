import { View, Text, StyleSheet } from "react-native";

import { Card, Skeleton } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../../themes/tokens";

const ROW_HEIGHT = 58;

// "İÇİNDE NE VAR": dosyadaki basliklar ve GERCEK sayilar. Sayisi
// okunamayan satirin sagi bos kalir (uydurma sayi yok).
export function DataContentsCard({ counts, loading }) {
  const C = useC();
  const rows = [
    { key: "trials", label: "Deneme kayıtları", value: counts?.trials, unit: "deneme" },
    { key: "sessions", label: "Çalışma oturumları", value: counts?.sessions, unit: "oturum" },
    { key: "wrong", label: "Yanlış defteri", value: counts?.wrongQuestions, unit: "soru" },
    { key: "days", label: "Rota geçmişi", value: counts?.studyDays, unit: "gün" },
  ];

  return (
    <Card radius="sheet" padded={false} style={[styles.card, { borderColor: C.elev }]}>
      {rows.map((r, i) => (
        <View
          key={r.key}
          style={[styles.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.line }]}
        >
          <Text style={[TYPOGRAPHY.bodyMedium, styles.flex, { color: C.text }]}>{r.label}</Text>
          {loading ? (
            <Skeleton width={64} height={14} />
          ) : r.value != null ? (
            <Text style={[TYPOGRAPHY.captionMedium, styles.value, { color: C.text3 }]}>
              {`${r.value.toLocaleString("tr-TR")} ${r.unit}`}
            </Text>
          ) : null}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: STEP.s2 + 2, paddingHorizontal: STEP.s3, paddingTop: STEP.s1 - 2, paddingBottom: STEP.s1 },
  row: { minHeight: ROW_HEIGHT, flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2 },
  flex: { flex: 1 },
  value: { fontVariant: ["tabular-nums"] },
});
