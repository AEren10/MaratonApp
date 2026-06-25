import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { TYPOGRAPHY, RADIUS } from "../../../themes/tokens";

function NumInput({ label, value, onChange, tone, max, C }) {
  return (
    <View style={styles.inputWrap}>
      <Text style={[styles.inputLabel, { color: tone }]}>{label}</Text>
      <TextInput
        value={String(value || "")}
        onChangeText={onChange}
        keyboardType="number-pad"
        maxLength={String(max).length}
        placeholder="0"
        placeholderTextColor={C.muted}
        style={[styles.input, { color: C.text, borderColor: tone + "30", backgroundColor: C.surface2 }]}
      />
    </View>
  );
}

function net(correct, wrong) {
  const c = parseInt(correct, 10) || 0;
  const w = parseInt(wrong, 10) || 0;
  return Math.max(0, c - w * 0.25);
}

export default function SubjectInputRow({ subject, values, onChange, C, color }) {
  const totalNet = net(values.c, values.w);
  return (
    <View style={[styles.row, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={styles.body}>
        <View style={styles.head}>
          <Text style={[styles.name, { color: C.text }]} numberOfLines={1}>{subject.name}</Text>
          <Text style={[styles.netBadge, { backgroundColor: color + "1A", color }]}>
            {totalNet.toFixed(2)} net
          </Text>
        </View>
        <View style={styles.inputs}>
          <NumInput label="D" value={values.c} onChange={(t) => onChange({ ...values, c: t.replace(/[^0-9]/g, "") })} tone={C.green} max={subject.max} C={C} />
          <NumInput label="Y" value={values.w} onChange={(t) => onChange({ ...values, w: t.replace(/[^0-9]/g, "") })} tone={C.red} max={subject.max} C={C} />
          <Text style={[styles.maxLabel, { color: C.muted }]}>/ {subject.max}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 18, borderWidth: 1, marginBottom: 10, overflow: "hidden" },
  body: { padding: 12 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  name: { ...TYPOGRAPHY.bodySemiBold, fontSize: 14, flex: 1 },
  netBadge: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  inputs: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  inputWrap: { width: 64 },
  inputLabel: { ...TYPOGRAPHY.micro, fontFamily: "Inter_600SemiBold", marginBottom: 3, textAlign: "center", letterSpacing: 0.5 },
  input: { fontFamily: "SpaceGrotesk_700Bold", fontSize: 18, borderRadius: RADIUS.md, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 7, textAlign: "center", letterSpacing: -0.3 },
  maxLabel: { ...TYPOGRAPHY.caption, marginLeft: 4, marginBottom: 8 },
});
