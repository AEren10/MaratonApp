import { Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

// Ust cizgili tek satir baglanti: "Konu borcu · 12 sa", "Bu haftanın raporu",
// "Rotanı gör". Deger yoksa yalniz etiket + ok.
export function HomeLinkRow({ label, value, onPress }) {
  const C = useC();
  return (
    <Pressable
      onPress={() => { H.tap(); onPress?.(); }}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={({ pressed }) => [s.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: C.text }]}>{label}</Text>
      {value ? <Text style={[TYPOGRAPHY.meta, s.value, { color: C.text3 }]}>{value}</Text> : null}
      <Icon name="chevR" size={12} color={C.text3} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, height: STEP.s5, borderTopWidth: 1 },
  label: { flex: 1 },
  value: { fontVariant: ["tabular-nums"] },
});
