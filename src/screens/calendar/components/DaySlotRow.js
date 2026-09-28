import React from "react";
import { View, Text } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

export function DaySlotRow({ time, color, name, subject, dur, C }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: STEP.s2, paddingVertical: STEP.s2, marginTop: 4 }}>
      <Text style={[TYPOGRAPHY.metaSemiBold, { width: 36, color: C.text3, paddingTop: 1 }]}>{time}</Text>
      <View style={{ width: 2, height: 28, backgroundColor: color, borderRadius: 1, marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>{name}</Text>
        {subject ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{subject}</Text> : null}
      </View>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>{dur}</Text>
    </View>
  );
}
