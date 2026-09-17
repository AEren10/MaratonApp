import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

export function ReorganizeTaskRow({
  task,
  idx,
  isDone,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  C,
}) {
  const subjectName = task.s?.label || task.s?.key || "Durak";

  return (
    <View
      style={[
        s.taskRow,
        {
          backgroundColor: isDone ? "transparent" : C.surface,
          borderColor: isDone ? C.line : C.elev,
        },
      ]}
    >
      <View style={[s.colorBar, { backgroundColor: isDone ? C.text3 : (task.s?.color || C.accent) }]} />
      <View style={s.taskTextWrap}>
        <Text
          style={[
            TYPOGRAPHY.bodySemiBold,
            {
              color: isDone ? C.text3 : C.text,
              textDecorationLine: isDone ? "line-through" : "none",
            },
          ]}
          numberOfLines={1}
        >
          {subjectName} · {task.topic}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]}>
          {isDone ? "Tamamlandı" : (idx === 0 ? "Sıradaki durak" : `${idx + 1}. durak`)}
        </Text>
      </View>

      {!isDone ? (
        <View style={s.actionsRow}>
          <Pressable
            disabled={!canMoveUp}
            onPress={onMoveUp}
            hitSlop={STEP.s1}
            style={[s.iconBtn, { opacity: canMoveUp ? 1 : 0.25 }]}
            accessibilityLabel="Yukarı taşı"
          >
            <Icon name="chevU" size={16} color={C.text} />
          </Pressable>
          <Pressable
            disabled={!canMoveDown}
            onPress={onMoveDown}
            hitSlop={STEP.s1}
            style={[s.iconBtn, { opacity: canMoveDown ? 1 : 0.25 }]}
            accessibilityLabel="Aşağı taşı"
          >
            <Icon name="chevD" size={16} color={C.text} />
          </Pressable>
          <Pressable
            onPress={onRemove}
            hitSlop={STEP.s1}
            style={s.iconBtn}
            accessibilityLabel="Duraktan çıkar"
          >
            <Icon name="x" size={16} color={C.text3} />
          </Pressable>
        </View>
      ) : (
        <View style={[s.donePill, { backgroundColor: C.up + "20" }]}>
          <Icon name="check" size={12} color={C.up} sw={2.6} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: STEP.s3,
    paddingVertical: STEP.s2 + STEP.s1 / 2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    gap: STEP.s2,
  },
  colorBar: {
    width: 3.5,
    height: STEP.s4,
    borderRadius: SHAPE.chip / 4,
  },
  taskTextWrap: { flex: 1, minWidth: 0 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  iconBtn: {
    width: STEP.s4,
    height: STEP.s4,
    alignItems: "center",
    justifyContent: "center",
  },
  donePill: {
    width: STEP.s3 + STEP.s1 / 2,
    height: STEP.s3 + STEP.s1 / 2,
    borderRadius: (STEP.s3 + STEP.s1 / 2) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
