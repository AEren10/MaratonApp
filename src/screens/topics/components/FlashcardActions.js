import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER, SHAPE } from "../../../themes/tokens";

export function FlashcardActions({ onPrev, onNext, isFirst, isLast, C }) {
  return (
    <View style={s.actions}>
      <Pressable onPress={onPrev} style={[s.navBtn, { backgroundColor: C.surface }, isFirst && s.disabled]}>
        <Icon name="arrowL" size={20} color={C.text} />
      </Pressable>

      <Pressable onPress={() => onNext(false)} style={[s.actionBtn, { backgroundColor: C.danger + "20" }]}>
        <Icon name="x" size={20} color={C.danger} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.danger }]}>Tekrar et</Text>
      </Pressable>

      <Pressable onPress={() => onNext(true)} style={[s.actionBtn, { backgroundColor: C.up + "20" }]}>
        <Icon name="check" size={20} color={C.up} />
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.up }]}>Bildim</Text>
      </Pressable>

      <Pressable onPress={() => onNext(false)} style={[s.navBtn, { backgroundColor: C.surface }, isLast && s.disabled]}>
        <Icon name="arrowR" size={20} color={C.text} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s2,
    paddingHorizontal: GUTTER,
    paddingBottom: STEP.s4,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    borderRadius: SHAPE.pill,
    paddingHorizontal: STEP.s3,
    paddingVertical: STEP.s2,
  },
  disabled: {
    opacity: 0.3,
  },
});
