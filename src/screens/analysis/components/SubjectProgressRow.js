import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SHAPE, STEP } from "../../../themes/tokens";

export function SubjectProgressRow({ C, item, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name} detayı`}
      onPress={onPress}
      style={[s.row, { borderTopColor: C.line }]}
    >
      <View style={s.top}>
        <View style={[s.dot, { backgroundColor: item.color }]} />
        <Text style={[s.name, { color: C.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[s.badge, { color: item.badgeColor || C.warn }]}>{item.badge}</Text>
      </View>

      <View style={s.bottom}>
        <View style={[s.track, { backgroundColor: C.track }]}>
          <View style={[s.fill, { width: item.pct || "60%", backgroundColor: item.barColor || C.accent }]} />
        </View>
        <Text style={[s.meta, { color: C.text3 }]}>{item.meta}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: {
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: SHAPE.chip / 6,
  },
  name: {
    flex: 1,
    fontFamily: "Archivo_500",
    fontSize: 14,
  },
  badge: {
    fontFamily: "Archivo_600",
    fontSize: 11.5,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    marginTop: STEP.s1,
    paddingLeft: STEP.s3,
  },
  track: {
    flex: 1,
    height: 5,
    borderRadius: SHAPE.chip / 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: SHAPE.chip / 3,
  },
  meta: {
    fontFamily: "Archivo_500",
    fontSize: 11.5,
  },
});