import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function PlanDetailStopRow({ done, C, subject, title, meta, hasStart, onStart, onToggle }) {
  return (
    <View style={s.stopRow}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`${subject} tamamlandı olarak işaretle`}
      >
        {done ? (
          <View style={[s.checkWrap, { backgroundColor: C.up }]}>
            <Icon name="check" size={13} color={C.bg} sw={2.8} />
          </View>
        ) : (
          <View style={[s.circle, { borderColor: hasStart ? C.accent : C.text3 }]} />
        )}
      </Pressable>

      <View style={s.body}>
        <Text
          style={[
            TYPOGRAPHY.bodySemiBold,
            {
              color: done ? C.text3 : C.text,
              textDecorationLine: done ? "line-through" : "none",
            },
          ]}
          numberOfLines={1}
        >
          {subject} · {title}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]}>{meta}</Text>
      </View>

      {hasStart ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${subject} çalışmaya başla`}
          onPress={onStart}
          style={[s.startBtn, { backgroundColor: C.elev, borderColor: C.line }]}
        >
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>Başla</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  stopRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: 44 },
  checkWrap: { width: 22, height: 22, borderRadius: 22 / 2, alignItems: "center", justifyContent: "center" },
  circle: { width: 22, height: 22, borderRadius: 22 / 2, borderWidth: 1.8 },
  body: { flex: 1, minWidth: 0 },
  startBtn: {
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s1 / 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
});
