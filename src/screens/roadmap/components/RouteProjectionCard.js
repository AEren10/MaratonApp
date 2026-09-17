import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// "BU TEMPOYLA SINAV GÜNÜ" karti: tahmin, hedefe mesafe, Tahmin aralığıigi.
// Tahmin yoksa (3 denemeden az) tasarimin kendi hali: "—" ve acilma notu.
export function RouteProjectionCard({ projectedNet, note, rangeText }) {
  const C = useC();
  return (
    <View style={[s.card, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU TEMPOYLA SINAV GÜNÜ</Text>
      <View style={s.row}>
        <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{projectedNet ?? "—"}</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, s.note, { color: C.text3 }]}>
          net{note ? ` · ${note}` : ""}
        </Text>
      </View>
      <View style={[s.range, { borderTopColor: C.elev }]}>
        <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text3 }]}>Tahmin aralığı</Text>
        <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{rangeText}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  note: {
    flexShrink: 1,
    paddingBottom: 6,
  },
  range: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
});


