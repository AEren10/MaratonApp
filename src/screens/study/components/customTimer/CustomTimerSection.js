import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../../components/design/Icon";
import { Press } from "../../../../components/design/Press";
import * as H from "../../../../lib/haptics";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../../themes/tokens";
import { CustomTimerPresets } from "./CustomTimerPresets";

export function CustomTimerSection({
  label,
  value,
  unit,
  min = 1,
  max = 120,
  step = 1,
  presets = [],
  onChange,
  C,
}) {
  const handleDec = () => {
    if (value > min) {
      H.tap();
      onChange(Math.max(min, value - step));
    }
  };

  const handleInc = () => {
    if (value < max) {
      H.tap();
      onChange(Math.min(max, value + step));
    }
  };

  return (
    <View style={s.container}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{label}</Text>
      <View style={[s.card, { backgroundColor: C.void, borderColor: C.line }]}>
        <View style={s.row}>
          <Press
            haptic="none"
            scaleTo={0.92}
            onPress={handleDec}
            disabled={value <= min}
            accessibilityRole="button"
            accessibilityLabel={`${label} azalt`}
            style={[
              s.btn,
              {
                backgroundColor: C.surface,
                borderColor: C.border,
                opacity: value <= min ? 0.4 : 1,
              },
            ]}
          >
            <Icon name="minus" size={18} color={C.text} />
          </Press>

          <View style={s.display}>
            <Text style={[TYPOGRAPHY.statPosterSide, { color: C.text }]} allowFontScaling={false}>
              {value}
            </Text>
            <Text style={[TYPOGRAPHY.caption, { color: C.text3 }]}>
              {unit}
            </Text>
          </View>

          <Press
            haptic="none"
            scaleTo={0.92}
            onPress={handleInc}
            disabled={value >= max}
            accessibilityRole="button"
            accessibilityLabel={`${label} artır`}
            style={[
              s.btn,
              {
                backgroundColor: C.surface,
                borderColor: C.border,
                opacity: value >= max ? 0.4 : 1,
              },
            ]}
          >
            <Icon name="plus" size={18} color={C.text} />
          </Press>
        </View>

        <CustomTimerPresets
          presets={presets}
          value={value}
          unit={unit}
          onChange={onChange}
          C={C}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginTop: STEP.s3 },
  card: { marginTop: STEP.s1, padding: STEP.s2, borderRadius: SHAPE.cardTight, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  btn: { width: 44, height: 44, borderRadius: SHAPE.iconBox, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  display: { alignItems: "center", justifyContent: "center" },
});
