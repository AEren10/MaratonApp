import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { subjectColorOf } from "../../../themes/subjectPalette";

export const AddTaskSubjectRow = React.memo(function AddTaskSubjectRow({ subject, selected, onPress, C }) {
  const color = subjectColorOf(C, subject.key);
  // Mock remaining topics based on subject name
  let topicsLeft = 12;
  if (subject.key === "turkce") topicsLeft = 8;
  if (subject.key === "matematik") topicsLeft = 16;
  if (subject.key === "biyoloji") topicsLeft = 11;
  if (subject.key === "tarih") topicsLeft = 9;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={subject.label || subject.name}
      style={[st.row, { borderTopColor: C.line }]}
    >
      <View style={[st.dot, { backgroundColor: color }]} />
      <Text style={[TYPOGRAPHY.bodyMedium, st.name, { color: selected ? C.text : C.text2 }]} numberOfLines={1}>
        {subject.label || subject.name}
      </Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{topicsLeft} konu kaldı</Text>
      <View style={[st.radio, { borderColor: selected ? color : C.border }]}>
        {selected ? <View style={[st.radioDot, { backgroundColor: color }]} /> : null}
      </View>
    </Pressable>
  );
});

const st = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, height: 56, borderTopWidth: 1 },
  dot: { width: 9, height: 9, borderRadius: 1 },
  name: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.8, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  radioDot: { width: 9, height: 9, borderRadius: 1 },
});
