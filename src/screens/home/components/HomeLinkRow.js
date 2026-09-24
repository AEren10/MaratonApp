import { Text, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press, PRESS_ROW } from "../../../components/design/Press";

// Ust cizgili tek satir baglanti: "Konu borcu · 12 sa", "Bu haftanın raporu",
// "Rotanı gör". Deger yoksa yalniz etiket + ok.
export function HomeLinkRow({ label, value, onPress }) {
  const C = useC();
  return (
    <Press
      onPress={() => onPress?.()}
      scaleTo={PRESS_ROW}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={[s.row, { borderTopColor: C.line }]}
    >
      <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: C.text }]}>{label}</Text>
      {value ? <Text style={[TYPOGRAPHY.meta, s.value, { color: C.text3 }]}>{value}</Text> : null}
      <Icon name="chevR" size={12} color={C.text3} />
    </Press>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, height: STEP.s5, borderTopWidth: 1 },
  label: { flex: 1 },
  value: { fontVariant: ["tabular-nums"] },
});
