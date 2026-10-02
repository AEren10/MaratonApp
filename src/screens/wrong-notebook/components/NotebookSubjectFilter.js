import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Press } from "../../../components/design/Press";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function Chip({ chip, active, onPress, C }) {
  const sid = useSubjectIdentity(chip.key);
  return (
    <Press
      haptic="tap"
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[s.chip, { borderColor: active ? C.selBorder : C.line, backgroundColor: active ? C.selFill : "transparent" }]}
    >
      {chip.key ? <View style={[s.dot, { backgroundColor: sid?.solid || C.text3 }]} /> : null}
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: active ? C.selText : C.text2 }]}>{chip.label}</Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{chip.count}</Text>
    </Press>
  );
}

// Defter ders filtresi: yatay kayan ciplar, yalniz yanlisi olan dersler.
// Tek ders varsa gosterilmez (secilecek bir sey yok).
export function NotebookSubjectFilter({ chips, total, value, onChange }) {
  const C = useC();
  if (!chips || chips.length < 2) return null;
  const all = { key: null, label: "Tümü", count: total };
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {[all, ...chips].map((chip) => (
        <Chip key={chip.key || "all"} chip={chip} C={C} active={(value || null) === chip.key} onPress={() => onChange(chip)} />
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: GUTTER, gap: STEP.s1, paddingTop: STEP.s3 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6, minHeight: CONTROL.tapMin - 8,
    paddingHorizontal: STEP.s2, borderRadius: SHAPE.chip, borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
