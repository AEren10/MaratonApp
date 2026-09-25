import { StyleSheet, Text, TextInput, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

// DOGRU / YANLIS satiri: sayiya dokun-yaz, arti-eksi ince ayar. warn = Form Hatasi.
export function TrialCountStepper({ label, value, max, warn, onChangeText, onStep }) {
  const C = useC();
  const count = parseInt(value, 10) || 0;
  const tone = warn ? C.warn : C.text2;
  return (
    <View style={[styles.row, { backgroundColor: C.surface, borderColor: warn ? C.warn : C.elev }]}>
      <Text style={[TYPOGRAPHY.label, styles.label, { color: tone }]}>{label.toLocaleUpperCase("tr-TR")}</Text>
      <TextInput accessibilityLabel={label} value={String(value ?? "")} onChangeText={onChangeText}
        onFocus={() => H.tap()} keyboardType="number-pad" maxLength={String(max).length}
        placeholder="0" placeholderTextColor={C.text3} selectTextOnFocus
        style={[TYPOGRAPHY.inputTopic, styles.input, {
          color: C.text, backgroundColor: C.void, borderColor: warn ? C.warn : C.border,
        }]} />
      <Press haptic="none" onPress={() => onStep(-1)} disabled={count <= 0} style={styles.step}
        accessibilityRole="button" accessibilityLabel={`${label} bir azalt`}>
        <Icon name="minus" size={14} color={C.text3} sw={2} />
      </Press>
      <Press haptic="none" onPress={() => onStep(1)} disabled={count >= max} style={[styles.step, { backgroundColor: C.elev }]}
        accessibilityRole="button" accessibilityLabel={`${label} bir artır`}>
        <Icon name="plus" size={14} color={C.text} sw={2} />
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1, height: 56,
    paddingLeft: STEP.s2 + 2, paddingRight: 5, borderRadius: SHAPE.cardTight, borderWidth: 1,
  },
  label: { flex: 1, fontFamily: "Archivo_700", letterSpacing: 1.6 },
  input: {
    minWidth: 54, height: 40, paddingHorizontal: STEP.s2, paddingVertical: 0, borderRadius: SHAPE.button,
    borderWidth: 1, textAlign: "center", fontVariant: ["tabular-nums"],
  },
  step: {
    width: CONTROL.tapMin, height: CONTROL.tapMin, borderRadius: SHAPE.button,
    alignItems: "center", justifyContent: "center",
  },
});
