import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../../themes/tokens";

// Donem kunyesi tek satirda: "4 durak  118 soru  ·····  seri 47 gün"
export function SummaryLedger({ items = [] }) {
  const C = useC();
  if (items.length < 2) return null;
  const last = items[items.length - 1];
  return (
    <View style={styles.wrap}>
      <View style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}>
        {items.slice(0, -1).map((item) => (
          <Text key={item} style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{item}</Text>
        ))}
        <View style={styles.flex} />
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{last}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s2, paddingHorizontal: GUTTER },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s3, paddingVertical: STEP.s2, paddingHorizontal: STEP.s3, borderRadius: SHAPE.panel, borderWidth: 1 },
  flex: { flex: 1 },
});
