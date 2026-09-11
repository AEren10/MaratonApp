import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { SectionLabel } from "../../../components/design";

const fmtToday = () => {
  const label = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  return `Bugün · ${label}`;
};

export function AddTaskWhenSection({ C }) {
  return (
    <View>
      <SectionLabel>Ne zaman</SectionLabel>
      <View style={[st.row, { borderColor: C.line }]}>
        <Text style={[TYPOGRAPHY.body, { color: C.text2, flex: 1 }]}>Tarih</Text>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{fmtToday()}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    height: 60, borderTopWidth: 1, borderBottomWidth: 1,
  },
});
