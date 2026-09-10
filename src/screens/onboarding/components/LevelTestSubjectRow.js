import { memo } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// Tasarim: renk noktasi + ders adi + net input + "net" etiketi, tek satir.
function LevelTestSubjectRow({ subject, value, onChangeText }) {
  const C = useC();
  return (
    <View
      style={[styles.row, { backgroundColor: C.surface, borderColor: C.elev }]}
      accessible
      accessibilityLabel={`${subject.name} net girişi`}
    >
      <View style={[styles.dot, { backgroundColor: subject.color }]} />
      <Text style={[TYPOGRAPHY.bodyMedium, styles.name, { color: C.text }]}>
        {subject.name}
      </Text>
      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        placeholder="0"
        placeholderTextColor={C.text3}
        keyboardType="decimal-pad"
        maxLength={5}
        style={[TYPOGRAPHY.subheading, styles.input, { color: C.text }]}
        accessibilityLabel={`${subject.name} net değeri`}
      />
      <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>net</Text>
    </View>
  );
}

export default memo(LevelTestSubjectRow);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    height: 60,
    paddingHorizontal: STEP.s2 + 4,
    borderRadius: SHAPE.card,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
  name: { flex: 1 },
  input: { minWidth: 44, textAlign: "right", padding: 0 },
});
