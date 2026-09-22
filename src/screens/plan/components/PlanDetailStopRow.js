import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function PlanDetailStopRow({ done, C, subject, title, meta, hasStart, onStart, onToggle }) {
  return (
    <View style={s.stopRow}>
      <Pressable
        onPress={onToggle}
        hitSlop={STEP.s2}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`${subject} tamamlandı olarak işaretle`}
        style={({ pressed }) => [s.checkTouch, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
      >
        <View
          style={[
            s.circle,
            {
              borderColor: done ? C.up : (hasStart ? C.accent : C.text3),
              backgroundColor: done ? C.up : "transparent",
            },
          ]}
        >
          {done ? <Icon name="check" size={13} color={C.bg} sw={2.8} /> : null}
        </View>
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
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${subject} çalışmaya başla`}
            onPress={(e) => {
              H.tap();
              onStart?.(e);
            }}
            style={({ pressed }) => [
              s.startBtn,
              { backgroundColor: pressed ? C.surfacePressed : C.elev, borderColor: C.line },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>Başla</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  stopRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: 44 },
  checkTouch: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  circle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.8, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0 },
  startBtn: {
    paddingHorizontal: STEP.s2,
    paddingVertical: STEP.s1 / 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
});
