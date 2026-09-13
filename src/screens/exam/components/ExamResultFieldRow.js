import { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

// Sonuc alani: ders rengi nokta + etiket + 82px sayi kutusu. Sinir asilirsa
// kutu kenari uyari tonuna doner ve alt satirda aralik yazar.
export const ExamResultFieldRow = memo(function ExamResultFieldRow({ field, color, value, error, onChange }) {
  const C = useC();
  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: color }]} />
        <Text style={[TYPOGRAPHY.bodyMedium, s.label, { color: C.text }]}>{field.label}</Text>
        <TextInput
          value={value}
          onChangeText={(text) => onChange(field.key, text)}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={C.text3}
          accessibilityLabel={field.label}
          style={[
            TYPOGRAPHY.topicName,
            s.input,
            { color: C.text, backgroundColor: C.void, borderColor: error ? C.warn : C.border },
          ]}
        />
      </View>
      {error ? <Text style={[TYPOGRAPHY.micro, s.error, { color: C.warn }]}>{error}</Text> : null}
    </View>
  );
});

const s = StyleSheet.create({
  card: { paddingVertical: 15, paddingHorizontal: 17, borderRadius: SHAPE.panel, borderWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  dot: { width: 7, height: 7, borderRadius: 1 },
  label: { flex: 1 },
  input: {
    width: 82, height: CONTROL.segment, borderRadius: 11, borderWidth: 1,
    textAlign: "center", fontVariant: ["tabular-nums"], paddingVertical: 0,
  },
  error: { marginTop: STEP.s1, textAlign: "right" },
});
