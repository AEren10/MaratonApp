import { StyleSheet, Text } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

const HIT = { top: 3, bottom: 3 };

// Cip h38 r6; dokunma alani seffaf katmanla 44'e buyur. Secili = tik + marka tonu.
export function TrialEntryChip({ label, active, onPress, accessibilityLabel }) {
  const C = useC();
  return (
    <Press haptic="none" onPress={onPress} hitSlop={HIT} accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel || label} accessibilityState={{ selected: active }}
      style={[styles.chip, {
        backgroundColor: active ? C.brandTint : "transparent",
        borderColor: active ? C.accent : C.border,
      }]}>
      {active ? <Icon name="check" size={11} color={C.accent} sw={2.6} /> : null}
      <Text style={[TYPOGRAPHY.captionMedium, {
        fontFamily: active ? "Archivo_600" : "Archivo_500",
        color: active ? C.text : C.text2,
      }]}>
        {label}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: CONTROL.chip, paddingHorizontal: STEP.s2 + 4, borderRadius: SHAPE.chip, borderWidth: 1,
    flexDirection: "row", alignItems: "center", gap: STEP.s1,
  },
});
