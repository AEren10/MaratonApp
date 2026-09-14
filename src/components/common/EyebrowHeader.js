import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../design";
import { useC } from "../../contexts/ThemeContext";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../themes/tokens";

// Geri oku + bolum etiketi (tasarim: "BORÇ DAĞITIMI", "BOŞLUĞU KAPAT",
// Aylik Plan "PROGRAM"). Ok 44px dokunma alaninda, gorseli sola hizali.
export function EyebrowHeader({ label, onBack }) {
  const C = useC();
  return (
    <View style={s.row}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Geri" style={s.tap}>
        <Icon name="chevL" size={16} color={C.text2} />
      </Pressable>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text3 }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 / 2, paddingHorizontal: GUTTER - STEP.s2 },
  tap: { width: CONTROL.tapMin, height: CONTROL.tapMin, alignItems: "center", justifyContent: "center" },
  label: { flex: 1 },
});
