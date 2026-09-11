import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// Tema bir DERS degil: eski hali her secenegi C.blue/C.purple/C.amber ile
// boyuyordu, bunlar ders paletinin takma adlari. Secili hal accent ile
// isaretleniyor, secenegin kendine ait rengi yok.
export const ThemeOptionRow = React.memo(function ThemeOptionRow({
  C, label, hint, active, onPress, first,
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
      style={({ pressed }) => [
        styles.row,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.line },
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{label}</Text>
        {hint ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 3 }]}>{hint}</Text>
        ) : null}
      </View>
      <View style={[styles.radio, { borderColor: active ? C.accent : C.border }]}>
        {active ? <View style={[styles.dot, { backgroundColor: C.accent }]} /> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingHorizontal: STEP.s3,
    minHeight: CONTROL.tapMin + 12,
  },
  body: { flex: 1, minWidth: 0 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: SHAPE.chip,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 9, height: 9, borderRadius: 1 },
});
