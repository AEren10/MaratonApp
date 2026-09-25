import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Etiket solda, deger + chevron sagda. onPress yoksa salt gosterim.
export function RecordRow({ label, value, placeholder, onPress, children }) {
  const C = useC();
  const empty = !value;
  const body = (
    <>
      <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text2 }]}>{label}</Text>
      {children || (
        <Text numberOfLines={1} style={[TYPOGRAPHY.bodyMedium, styles.value, { color: empty ? C.text3 : C.text }]}>
          {value || placeholder}
        </Text>
      )}
      {onPress ? <Icon name="chevR" size={12} color={C.text5} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.row}>{body}</View>;
  return (
    <Press haptic="none" onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value || placeholder || ""}`} style={styles.row}>
      {body}
    </Press>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, minHeight: CONTROL.tapMin },
  label: { flex: 1, letterSpacing: 2.07 },
  value: { flexShrink: 1, maxWidth: "62%" },
});
