import React from "react";
import { View, Text, StyleSheet } from "react-native";

export function RouteTrialSubjects({ subjectList = [], C }) {
  if (!subjectList.length) return null;

  return (
    <View style={s.wrap}>
      {subjectList.map((sub) => (
        <View key={sub.key} style={[s.row, { borderBottomColor: C.line }]}>
          <View style={[s.dot, { backgroundColor: sub.color }]} />
          <Text style={[s.name, { color: C.text }]} numberOfLines={1}>{sub.label}</Text>
          <Text style={[s.cw, { color: C.text3 }]}>{sub.cw}</Text>
          <Text style={[s.net, { color: C.text }]}>{sub.net}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 14 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  name: { fontFamily: "Archivo_500", fontSize: 12.5, flex: 1 },
  cw: { fontFamily: "Archivo_400", fontSize: 11.5, marginRight: 10, fontVariant: ["tabular-nums"] },
  net: { fontFamily: "Bricolage_400", fontSize: 14, fontVariant: ["tabular-nums"] },
});
