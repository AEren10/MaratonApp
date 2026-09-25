import { View, Text, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, CONTROL } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Veri Indir / Hesap Silme ust satiri: 44px dokunma alanli geri (ya da
// kapat) + istege bagli bolum etiketi.
export function SystemHeader({ icon = "arrowL", label, onPress, a11y = "Geri" }) {
  const C = useC();
  return (
    <View style={styles.row}>
      <Press haptic="none" onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y} style={styles.btn}>
        <Icon name={icon} size={icon === "x" ? 18 : 22} color={C.text2} />
      </Press>
      {label ? <Text style={[TYPOGRAPHY.label, styles.label, { color: C.text3 }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: GUTTER, paddingTop: 4 },
  btn: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    marginLeft: -(STEP.s1 + 2),
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1 },
});
