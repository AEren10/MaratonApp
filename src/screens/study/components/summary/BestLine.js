import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../../themes/tokens";

// "HAFTANIN EN VERİMLİ GÜNÜ ——— Cumartesi · 152 soru"
export function BestLine({ line }) {
  const C = useC();
  if (!line) return null;
  return (
    <View style={styles.row}>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{line.label}</Text>
      <View style={[styles.rule, { backgroundColor: C.line }]} />
      <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{line.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s3, paddingHorizontal: GUTTER },
  rule: { flex: 1, height: 1 },
});
