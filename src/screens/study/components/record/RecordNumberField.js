import { View, Text, TextInput, StyleSheet } from "react-native";

import { Icon } from "../../../../components/design";
import { useC } from "../../../../contexts/ThemeContext";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Void kuyulu sayi girisi ("40", "50 dk"). locked: kesik kenar + kilit, duzenlenmez.
export function RecordNumberField({ value, onChange, suffix, width = 76, locked, maxLength = 4, a11yLabel }) {
  const C = useC();
  if (locked) {
    return (
      <View accessibilityLabel={a11yLabel} style={[styles.box, styles.locked, { borderColor: C.border }]}>
        <Icon name="lock" size={11} color={C.text4} />
        <Text style={[TYPOGRAPHY.statMedium, styles.num, { color: C.text2 }]}>
          {`${value}${suffix ? ` ${suffix}` : ""}`}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.box, { width, backgroundColor: C.void, borderColor: C.border }]}>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        maxLength={maxLength}
        placeholder="0"
        placeholderTextColor={C.text3}
        accessibilityLabel={a11yLabel}
        selectTextOnFocus
        style={[TYPOGRAPHY.inputStat, styles.num, styles.input, { color: C.text }]}
      />
      {suffix ? (
        <Text style={[TYPOGRAPHY.bodyMedium, styles.suffix, { color: C.text3 }]}>
          {suffix}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: CONTROL.buttonTertiary,
    minWidth: 72,
    borderRadius: SHAPE.chip + 2,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s1,
  },
  locked: {
    borderStyle: "dashed",
    gap: STEP.s1,
    paddingHorizontal: STEP.s2,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
  input: {
    paddingVertical: STEP.s1 - STEP.s1,
    textAlign: "center",
    minWidth: 28,
  },
  suffix: {
    marginLeft: STEP.s1 / 4,
  },
});
