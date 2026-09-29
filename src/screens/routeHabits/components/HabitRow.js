import { memo } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Tek rutin satiri: ad + ders, acik/kapali, acikken gunluk soru adedi (+/- 5).
export const HabitRow = memo(function HabitRow({ C, preset, enabled, questions, onToggle, onStep, first }) {
  return (
    <View style={[s.row, !first && { borderTopWidth: 1, borderTopColor: C.line }]}>
      <View style={s.head}>
        <View style={s.flex}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{preset.label}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{preset.subjectLabel} · her çalışma günü</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: C.accent, false: C.track }}
          accessibilityLabel={`${preset.label} rutini`}
        />
      </View>
      {enabled ? (
        <View style={s.stepper}>
          <Text style={[TYPOGRAPHY.meta, s.flex, { color: C.text2 }]}>Günde</Text>
          <Press haptic="select" accessibilityLabel="Azalt" onPress={() => onStep(-5)} style={[s.btn, { borderColor: C.border }]}>
            <Icon name="minus" size={14} color={C.text2} />
          </Press>
          <Text style={[TYPOGRAPHY.statSmall, s.value, { color: C.text }]}>{questions}</Text>
          <Press haptic="select" accessibilityLabel="Artır" onPress={() => onStep(5)} style={[s.btn, { borderColor: C.border }]}>
            <Icon name="plus" size={14} color={C.text2} />
          </Press>
          <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>soru</Text>
        </View>
      ) : null}
    </View>
  );
});

const s = StyleSheet.create({
  row: { paddingVertical: STEP.s2 + 2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin },
  flex: { flex: 1 },
  stepper: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  btn: { width: CONTROL.tapMin, height: CONTROL.tapMin, borderRadius: SHAPE.chip, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  value: { minWidth: 44, textAlign: "center" },
});
