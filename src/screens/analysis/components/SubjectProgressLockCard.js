import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { SHAPE, STEP } from "../../../themes/tokens";

export function SubjectProgressLockCard({ C, onPress }) {
  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={[s.lockBox, { backgroundColor: C.void, borderColor: C.elev }]}>
        <Icon name="lock" size={12} color={C.text3} />
      </View>

      <View style={s.blurRows}>
        <View style={s.blurRow}>
          <View style={[s.dot, { backgroundColor: C.subjects?.kimya || "#E8A0C4" }]} />
          <View style={[s.line, { backgroundColor: C.elev }]} />
          <View style={[s.tag, { backgroundColor: C.elev }]} />
        </View>
        <View style={s.blurRow}>
          <View style={[s.dot, { backgroundColor: C.subjects?.biyoloji || "#86CE92" }]} />
          <View style={[s.line, { backgroundColor: C.elev }]} />
          <View style={[s.tag, { backgroundColor: C.elev }]} />
        </View>
        <View style={s.blurRow}>
          <View style={[s.dot, { backgroundColor: C.subjects?.tarih || "#C9BE6A" }]} />
          <View style={[s.line, { backgroundColor: C.elev }]} />
          <View style={[s.tag, { backgroundColor: C.elev }]} />
        </View>
      </View>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Kalan 3 öncelikli konunu gör"
        style={({ pressed }) => [
          s.btn,
          {
            borderColor: C.accent,
            backgroundColor: pressed ? (C.brandTint || C.elev) : "transparent",
          },
        ]}
      >
        <Icon name="lock" size={13} color={C.accent} />
        <Text style={[s.btnText, { color: C.accentBright }]}>
          Kalan 3 öncelikli konunu gör
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginTop: STEP.s2,
    padding: STEP.s3,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    position: "relative",
  },
  lockBox: {
    position: "absolute",
    right: STEP.s2,
    top: STEP.s2,
    width: 24,
    height: 24,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  blurRows: {
    gap: STEP.s2,
    opacity: 0.55,
  },
  blurRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: SHAPE.chip / 6,
  },
  line: {
    flex: 1,
    height: 11,
    borderRadius: SHAPE.chip / 2,
  },
  tag: {
    width: 34,
    height: 15,
    borderRadius: SHAPE.chip / 2,
  },
  btn: {
    height: 46,
    marginTop: STEP.s3,
    borderRadius: SHAPE.button,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s1,
  },
  btnText: {
    fontFamily: "Archivo_600",
    fontSize: 13,
  },
});