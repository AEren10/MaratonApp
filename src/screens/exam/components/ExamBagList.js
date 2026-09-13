import { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";
import { ExamCheckRow } from "./ExamCheckRow";

// ÇANTA: sabit kalemler + kullanicinin ekledikleri. "Kendin ekle" satiri
// dokununca ayni yerde yazma alanina donusur.
export function ExamBagList({ items, onToggle, onAdd }) {
  const C = useC();
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const textRef = useRef("");

  const change = (value) => { textRef.current = value; setText(value); };

  // onSubmitEditing ardindan onBlur da tetiklenir: ref bosaltildigi icin
  // ikinci cagri ayni kalemi tekrar eklemez.
  const submit = () => {
    const value = textRef.current;
    textRef.current = "";
    if (value.trim()) onAdd?.(value);
    setText("");
    setAdding(false);
  };

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ÇANTA</Text>
      <View style={s.list}>
        {items.map((item) => (
          <ExamCheckRow key={item.key} item={item} onToggle={onToggle} />
        ))}
        <Pressable
          onPress={() => setAdding(true)}
          accessibilityRole="button"
          accessibilityLabel="Kendin ekle"
          style={[s.row, { borderTopColor: C.line, borderBottomColor: C.line }]}
        >
          <View style={[s.plus, { borderColor: C.border }]}>
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text3 }]}>+</Text>
          </View>
          {adding ? (
            <TextInput
              autoFocus
              value={text}
              onChangeText={change}
              onSubmitEditing={submit}
              onBlur={submit}
              returnKeyType="done"
              accessibilityLabel="Kendin ekle"
              style={[TYPOGRAPHY.bodyMedium, s.input, { color: C.text }]}
            />
          ) : (
            <Text style={[TYPOGRAPHY.bodyMedium, s.input, { color: C.text3 }]}>Kendin ekle</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  list: { marginTop: 6 },
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 3,
    minHeight: CONTROL.tapMin + STEP.s2, borderTopWidth: 1, borderBottomWidth: 1,
  },
  plus: {
    width: 24, height: 24, borderRadius: 4, borderWidth: 1.8, borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  input: { flex: 1, paddingVertical: 0 },
});
