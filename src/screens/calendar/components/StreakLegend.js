import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Takvim lejandi. "Donduruldu" ogesi yok: donma gunleri gun bazinda
// tutulmuyor, izgarada o hal cizilemiyor.
export function StreakLegend() {
  const C = useC();
  const items = [
    { label: "Hedef tuttu", box: { backgroundColor: C.brandFill, borderColor: C.brandFill } },
    { label: "Seri sürdü", box: { backgroundColor: C.brandTint, borderColor: C.bandEdge } },
    { label: "Gelecek", box: { borderColor: C.line } },
  ];
  return (
    <View style={s.row}>
      {items.map((it) => (
        <View key={it.label} style={s.item}>
          <View style={[s.box, it.box]} />
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
});
