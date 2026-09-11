import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { SectionLabel } from "../../../components/design";

export function AddTaskNoteField({ value, onChange, C }) {
  return (
    <View>
      <SectionLabel>Not (opsiyonel)</SectionLabel>
      <TextInput
        value={value} onChangeText={onChange} placeholder="Kendine bir not bırak..." placeholderTextColor={C.text3}
        multiline maxLength={140}
        style={[st.input, { backgroundColor: C.surface, borderColor: C.border, color: C.text }]}
      />
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, textAlign: "right", marginTop: 4 }]}>{value.length}/140</Text>
    </View>
  );
}

const st = StyleSheet.create({
  input: {
    paddingHorizontal: STEP.s3, paddingVertical: STEP.s3, borderRadius: SHAPE.cardTight,
    borderWidth: 1, fontFamily: "Archivo_400", fontSize: 14, minHeight: 80, textAlignVertical: "top",
  },
});
