import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// "BU TEMPOYLA SINAV GÜNÜ" karti: tahmin, hedefe mesafe, tahmin araligi.
// Tahmin yoksa (3 denemeden az) tasarimin kendi hali: "—" ve acilma notu.
export function RouteProjectionCard({ projectedNet, note, rangeText }) {
  const C = useC();
  return (
    <View style={s.pad}>
      <View style={[s.card, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU TEMPOYLA SINAV GÜNÜ</Text>
        <View style={s.row}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{projectedNet ?? "—"}</Text>
          <Text style={[TYPOGRAPHY.bodyMedium, s.note, { color: C.text3 }]}>net · {note}</Text>
        </View>
        <View style={[s.range, { borderTopColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text3 }]}>Tahmin aralığı</Text>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{rangeText}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: GUTTER, paddingTop: STEP.s3 },
  card: { padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s2, marginTop: STEP.s2 },
  note: { flexShrink: 1, paddingBottom: STEP.s1 },
  range: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginTop: STEP.s2,
    paddingTop: STEP.s2,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
});
