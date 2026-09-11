import React from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function AddTaskPillRow({ presets, value, onChange, formatLabel, C, suffix, placeholder }) {
  const isPreset = presets.includes(parseInt(value, 10));
  return (
    <View style={st.row}>
      {presets.map((p) => {
        const active = value === String(p);
        return (
          <Pressable
            key={p}
            onPress={() => { H.tap(); onChange(String(p)); }}
            style={[
              st.pill,
              {
                backgroundColor: active ? C.brandTint : C.surface,
                borderColor: active ? C.accent : C.border,
              },
            ]}
          >
            <Text style={[TYPOGRAPHY.bodySemiBold, { color: active ? C.accent : C.text }]}>
              {formatLabel(p)}
            </Text>
          </Pressable>
        );
      })}
      <View style={[st.pill, st.inputPill, { backgroundColor: C.surface, borderColor: !isPreset && value ? C.accent : C.border }]}>
        <TextInput
          value={isPreset ? "" : value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ""))}
          placeholder={placeholder}
          placeholderTextColor={C.text3}
          keyboardType="number-pad"
          style={[TYPOGRAPHY.bodySemiBold, st.input, { color: C.text }]}
          maxLength={3}
        />
        {!isPreset && value ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 },
  pill: { flex: 1, height: 52, borderRadius: SHAPE.cardTight, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  inputPill: { flexDirection: "row", gap: 4 },
  input: { textAlign: "center", minWidth: 30, padding: 0 },
});
