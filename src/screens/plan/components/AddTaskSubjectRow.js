import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { Press } from "../../../components/design/Press";

export const AddTaskSubjectRow = React.memo(function AddTaskSubjectRow({ subject, selected, onPress, C }) {
  const color = subjectColorOf(C, subject.key);
  // Eskiden uydurma "12 konu kaldı" yaziyordu; mufredattaki gercek konu sayisi.
  const topicCount = subject.topics?.length || 0;

  return (
    <Press haptic="none"
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
      {topicCount > 0 ? (
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{topicCount} konu</Text>
      ) : null}
      <View style={[st.radio, { borderColor: selected ? color : C.border }]}>
        {selected ? <View style={[st.radioDot, { backgroundColor: color }]} /> : null}
      </View>
    </Press>
  );
});

const st = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14, height: 56, borderTopWidth: 1 },
  dot: { width: 9, height: 9, borderRadius: 1 },
  name: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.8, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  radioDot: { width: 9, height: 9, borderRadius: 1 },
});
