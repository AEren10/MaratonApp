import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { alpha } from "../../../themes/palette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function StreakLegend() {
  const C = useC();
  const items = [
    { label: "Hedef tuttu", box: { backgroundColor: C.accent, borderColor: C.accent } },
    { label: "Seri sürdü", box: { backgroundColor: alpha(C.accent, 24), borderColor: alpha(C.accent, 45) } },
    { label: "Bugün", box: { borderColor: C.accent, borderWidth: 1.5 } },
    { label: "Gelecek", box: { borderColor: C.line } },
    { label: "Planlı", isDot: true },
  ];
  return (
    <View style={s.row}>
      {items.map((it) => (
        <View key={it.label} style={s.item}>
          {it.isDot ? (
            <View style={s.dotBox}>
              <View style={[s.planDot, { backgroundColor: C.accent }]} />
            </View>
          ) : (
            <View style={[s.box, it.box]} />
          )}
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", columnGap: STEP.s3 - 2, rowGap: STEP.s1 + 2, marginTop: STEP.s3 },
  item: { flexDirection: "row", alignItems: "center", gap: STEP.s1 - 1 },
  box: { width: 12, height: 12, borderRadius: SHAPE.chip - 2, borderWidth: 1 },
  dotBox: { width: 12, height: 12, alignItems: "center", justifyContent: "center" },
  planDot: { width: 6, height: 6, borderRadius: SHAPE.chip },
});
