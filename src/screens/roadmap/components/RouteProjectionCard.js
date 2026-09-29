import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// "BU TEMPOYLA SINAV GÜNÜ" karti: tahmin, hedefe mesafe, tahmin araligi.
export function RouteProjectionCard({ projectedNet, note, rangeText }) {
  const C = useC();
  const hasRange = Boolean(rangeText && rangeText !== "—");

  return (
    <View style={[s.card, { backgroundColor: C.brandTint, borderColor: C.bandEdge }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU TEMPOYLA SINAV GÜNÜ</Text>
      <View style={s.row}>
        <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{projectedNet ?? "—"}</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, s.note, { color: C.text3 }]}>
          net{note ? ` · ${note}` : ""}
        </Text>
      </View>
      {hasRange ? (
        <View style={[s.range, { borderTopColor: C.elev }]}>
          <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text3 }]}>Tahmin aralığı</Text>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{rangeText}</Text>
        </View>
      ) : null}
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
    gap: STEP.s1 + 2,
    marginTop: STEP.s1 + 2,
  },
  note: {
    flexShrink: 1,
    paddingBottom: STEP.s1 - 2,
  },
  range: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 + 2,
    marginTop: STEP.s2 + 4,
    paddingTop: STEP.s2 + 2,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
});
