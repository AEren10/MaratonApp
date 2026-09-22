import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function PlanDetailStopRow({ done, C, subject, title, meta, hasStart, isLast, onStart, onToggle }) {
  return (
    <View
      style={[
        s.stopRow,
        { borderTopColor: C.line },
        isLast && { borderBottomWidth: 1, borderBottomColor: C.line },
      ]}
    >
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
              borderColor: done ? C.up : (hasStart ? C.accent : C.border),
              backgroundColor: done ? C.up : "transparent",
              borderWidth: done ? 0 : 2,
            },
          ]}
        >
          {done ? <Icon name="check" size={11} color={C.bg} sw={2.4} /> : null}
        </View>
      </Pressable>

      <View style={s.body}>
        <Text
          style={[
            TYPOGRAPHY.tableName,
            {
              color: done ? C.text3 : C.text,
              textDecorationLine: done ? "line-through" : "none",
            },
          ]}
          numberOfLines={1}
        >
          {subject} · {title}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 2 }]}>{meta}</Text>
      </View>

      {hasStart ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${subject} çalışmaya başla`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={(e) => {
              H.tap();
              onStart?.(e);
            }}
            style={({ pressed }) => [
              s.startBtn,
              { backgroundColor: pressed ? (C.accent + "33") : (C.accent + "18") },
              pressed && { transform: [{ scale: 0.96 }] },
            ]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>Başla</Text>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    minHeight: 48,
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
  },
  checkTouch: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  circle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0 },
  startBtn: {
    height: 32,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.button - 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
