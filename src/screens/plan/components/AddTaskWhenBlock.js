import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function AddTaskWhenBlock({ repeat, onRepeatChange, C }) {
  return (
    <View style={s.wrap}>
      <View style={[s.row, { borderBottomColor: C.line }]}>
        <Text style={[TYPOGRAPHY.bodyMedium, s.flex, { color: C.text2 }]}>Tarih</Text>
        <View style={s.valRow}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Bugün · 23 Haz</Text>
          <Icon name="chevR" size={14} color={C.text4} />
        </View>
      </View>

      <View style={[s.row, { borderBottomColor: C.line }]}>
        <Text style={[TYPOGRAPHY.bodyMedium, s.flex, { color: C.text2 }]}>Saat</Text>
        <View style={s.valRow}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>19:30</Text>
          <Icon name="chevR" size={14} color={C.text4} />
        </View>
      </View>

      <View style={[s.row, s.noBorder]}>
        <Text style={[TYPOGRAPHY.bodyMedium, s.flex, { color: C.text2 }]}>Her hafta tekrarla</Text>
        <Switch
          value={repeat}
          onValueChange={onRepeatChange}
          trackColor={{ false: C.line, true: C.accent }}
          thumbColor={C.text}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingBottom: STEP.s4 },
  row: { flexDirection: "row", alignItems: "center", height: 56, borderBottomWidth: 1 },
  noBorder: { borderBottomWidth: 0, marginTop: STEP.s1 },
  flex: { flex: 1 },
  valRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
});
