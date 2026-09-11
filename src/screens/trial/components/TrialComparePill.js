import React from "react";
import { Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";

// Tasarim: iki deneme adi yan yana; secili olan brand-tint zeminli.
export const TrialComparePill = React.memo(function TrialComparePill({ C, label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, değiştir`}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? C.brandTint : "transparent",
          borderColor: active ? C.accent : C.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        style={[active ? TYPOGRAPHY.metaSemiBold : TYPOGRAPHY.meta, { color: active ? C.text : C.text2 }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
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
