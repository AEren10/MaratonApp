import { View, Text, TextInput, StyleSheet } from "react-native";
import { Card, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// SINAV YERI · SALON · CIKIS SAATI · ULASIM. Degerlerin hepsi kullanicinin
// kendi girdisi; bos alan "—" ile bekler, tahmin edilmez.
export function ExamPlanFieldsCard({ draft, leaveAtInvalid, onChange }) {
  const C = useC();
  const inputText = [TYPOGRAPHY.inputTable, { color: C.text }];

  const plain = (key, label) => (
    <View style={s.row}>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text2 }]}>{label}</Text>
      <TextInput
        value={draft[key]}
        onChangeText={(v) => onChange(key, v)}
        placeholder="—"
        placeholderTextColor={C.text3}
        accessibilityLabel={label}
        style={[inputText, s.plainInput]}
        returnKeyType="done"
      />
      <Icon name="chevR" size={12} color={C.text5} />
    </View>
  );

  const boxed = (key, label, extra) => (
    <View style={s.row}>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text2 }]}>{label}</Text>
      <TextInput
        value={draft[key]}
        onChangeText={(v) => onChange(key, v)}
        placeholder="—"
        placeholderTextColor={C.text3}
        accessibilityLabel={label}
        returnKeyType="done"
        {...extra?.input}
        style={[
          extra?.textStyle || inputText,
          s.box,
          { backgroundColor: C.void, borderColor: extra?.invalid ? C.warn : C.border },
          extra?.boxStyle,
        ]}
      />
    </View>
  );

  const divider = <View style={[s.hr, { backgroundColor: C.line }]} />;

  return (
    <Card tone="surface" radius="sheet" style={{ borderColor: C.elev }}>
      {plain("venue", "SINAV YERİ")}
      {divider}
      {boxed("hall", "SALON")}
      {divider}
      {boxed("leaveAt", "ÇIKIŞ SAATİ", {
        invalid: leaveAtInvalid,
        input: { keyboardType: "number-pad", maxLength: 5, placeholder: "--:--" },
        textStyle: [TYPOGRAPHY.inputTopic, { color: C.text, fontVariant: ["tabular-nums"], textAlign: "center" }],
        boxStyle: s.time,
      })}
      {divider}
      {plain("transport", "ULAŞIM")}
    </Card>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, minHeight: CONTROL.chip },
  label: { flex: 1 },
  plainInput: { flexShrink: 1, minWidth: 96, minHeight: CONTROL.tapMin, textAlign: "right", paddingVertical: 0 },
  box: {
    height: CONTROL.chip, minWidth: 96, paddingHorizontal: STEP.s2 + 2, paddingVertical: 0,
    borderRadius: SHAPE.button, borderWidth: 1,
  },
  time: { width: 88, minWidth: 88, paddingHorizontal: 0 },
  hr: { height: 1, marginVertical: STEP.s2 + 4 },
});
