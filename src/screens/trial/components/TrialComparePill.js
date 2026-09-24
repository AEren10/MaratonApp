import React from "react";
import { Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

// Tasarim: iki deneme adi yan yana; secili olan brand-tint zeminli.
export const TrialComparePill = React.memo(function TrialComparePill({ C, label, active, onPress }) {
  return (
    <Press haptic="none"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, değiştir`}
      style={[
        styles.pill,
        {
          backgroundColor: active ? C.brandTint : "transparent",
          borderColor: active ? C.accent : C.border
        }
      ]}
    >
      <Text
        style={[active ? TYPOGRAPHY.metaSemiBold : TYPOGRAPHY.meta, { color: active ? C.text : C.text2 }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Press>
  );
});

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    height: CONTROL.tapMin,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: STEP.s2,
  },
});
