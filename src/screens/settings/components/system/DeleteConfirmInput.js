import { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../../themes/tokens";

export const CONFIRM_WORD = "SİL";

export function isConfirmWord(value) {
  return String(value || "").trim().toLocaleUpperCase("tr-TR") === CONFIRM_WORD;
}

// "ONAYLA": kutuya SİL yazilmadan yikici buton acilmaz.
export function DeleteConfirmInput({ value, onChangeText, editable = true }) {
  const C = useC();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ONAYLA</Text>
      <Text style={[TYPOGRAPHY.meta, styles.hint, { color: C.text3 }]}>Devam etmek için kutuya SİL yaz.</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        maxLength={8}
        accessibilityLabel="Devam etmek için kutuya SİL yaz."
        selectionColor={C.accent}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          TYPOGRAPHY.tableName,
          styles.input,
          { color: C.text, backgroundColor: C.surface, borderColor: focused ? C.accent : C.border },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: STEP.s3 + 6 },
  hint: { marginTop: STEP.s2 - 2 },
  input: {
    height: CONTROL.tapMin + 4,
    marginTop: STEP.s2,
    paddingHorizontal: STEP.s3 - 4,
    borderRadius: STEP.s2 + 2,
    borderWidth: 1.5,
    letterSpacing: 1.9,
  },
});
