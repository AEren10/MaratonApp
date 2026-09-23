import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../../themes/tokens";

const EMPTY_CELLS = Array.from({ length: 10 }, (_, i) => i);

// Seri Sifir: "0 gün" ve kesikli cerceveli bos serit (suclamayan sifir hali).
export function StreakZeroHero() {
  const C = useC();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[TYPOGRAPHY.posterWord, styles.zero, { color: C.text3 }]} allowFontScaling={false}>0</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, styles.unit, { color: C.text3 }]}>gün</Text>
      </View>
      <View style={styles.strip}>
        {EMPTY_CELLS.map((i) => (
          <View key={i} style={[styles.cell, { borderColor: C.border }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", alignItems: "center", marginBottom: STEP.s3 },
  row: { width: 156, minHeight: 86, alignItems: "center", justifyContent: "center" },
  zero: { lineHeight: 86 },
  unit: { position: "absolute", right: 0, bottom: 18 },
  strip: { width: "86%", flexDirection: "row", gap: STEP.s1 - 2, marginTop: STEP.s3 },
  cell: { flex: 1, height: STEP.s4, borderRadius: SHAPE.chip, borderWidth: 1, borderStyle: "dashed", opacity: 0.72 },
});
