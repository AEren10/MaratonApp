import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// Tasarim: geri chevron + h42 r12 `void` zeminli alan, sagda temizleme.
export const SearchField = React.memo(function SearchField({
  C, value, onChange, onSubmit, onClear, onBack,
}) {
  return (
    <View style={styles.wrap}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
        <Icon name="arrowL" size={18} color={C.text2} />
      </Pressable>
      <View style={[styles.field, { backgroundColor: C.void, borderColor: C.border }]}>
        <Icon name="search" size={14} color={C.text3} />
        <TextInput
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onSubmit}
          placeholder="Konu ya da yanlış ara"
          placeholderTextColor={C.text3}
          returnKeyType="search"
          autoFocus
          autoCorrect={false}
          accessibilityLabel="Arama"
          style={[TYPOGRAPHY.bodyMedium, styles.input, { color: C.text }]}
        />
        {value ? (
          <Pressable
            onPress={onClear}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Aramayı temizle"
            style={[styles.clear, { backgroundColor: C.elev }]}
          >
            <Icon name="x" size={9} color={C.text3} sw={2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingHorizontal: 22, paddingTop: 6 },
  field: {
    flex: 1,
    height: 42,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  input: { flex: 1, paddingVertical: 0, minHeight: CONTROL.tapMin - 12 },
  clear: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
});
