import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function PlanDetailHeader({ dayLabel, onBack, C }) {
  return (
    <View style={s.header}>
      <Press haptic="none"
        accessibilityRole="button"
        accessibilityLabel="Geri"
        hitSlop={STEP.s2}
        onPress={onBack}
        style={s.backBtn}
      >
        <Icon name="chevL" size={18} color={C.text} />
        <Text style={[TYPOGRAPHY.subheading, { color: C.text }]}>{dayLabel}</Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingVertical: STEP.s2 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
});
