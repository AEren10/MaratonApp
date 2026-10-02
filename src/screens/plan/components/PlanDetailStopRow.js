import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function PlanDetailStopRow({
  done, C, subject, title, meta, hasStart, isLast, onStart, onToggle,
  isCarried, canPostpone, onOpenMenu, onEdit,
}) {
  return (
    <View
      style={[
        s.stopRow,
        { borderTopColor: C.line },
        isLast && { borderBottomWidth: 1, borderBottomColor: C.line },
      ]}
    >
      <Press haptic="none" scaleTo={0.92}
        onPress={onToggle}
        hitSlop={STEP.s2}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={done ? `${subject} tikini geri al` : `${subject} tamamlandı olarak işaretle`}
        style={[s.checkTouch]}
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
      </Press>

      <View style={s.body}>
        <View style={s.titleRow}>
          <Text
            style={[
              TYPOGRAPHY.tableName,
              {
                color: done ? C.text3 : C.text,
                textDecorationLine: done ? "line-through" : "none",
                flex: 1,
              },
            ]}
            numberOfLines={1}
          >
            {subject} · {title}
          </Text>
          {isCarried ? (
            <View style={[s.carriedBadge, { backgroundColor: C.void, borderColor: C.line }]}>
              <Text style={[TYPOGRAPHY.micro, { color: C.warn }]}>Bu haftadan</Text>
            </View>
          ) : null}
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 2 }]}>{meta}</Text>
      </View>

      {canPostpone ? (
        <Press
          haptic="light"
          onPress={(e) => {
            e?.stopPropagation?.();
            onOpenMenu?.();
          }}
          hitSlop={STEP.s2}
          style={s.moreBtn}
          accessibilityRole="button"
          accessibilityLabel="Durak seçenekleri"
        >
          <Icon name="more" size={14} color={C.text3} />
        </Press>
      ) : null}

      {done && onEdit ? (
        <Press
          haptic="light"
          onPress={onEdit}
          hitSlop={STEP.s1}
          style={[s.startBtn, { backgroundColor: C.void }]}
          accessibilityRole="button"
          accessibilityLabel={`${subject} kaydını düzenle`}
        >
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Düzenle</Text>
        </Press>
      ) : null}

      {hasStart ? (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <Press haptic="none" scaleTo={0.92}
            accessibilityRole="button"
            accessibilityLabel={`${subject} çalışmaya başla`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={(e) => {
              H.tap();
              onStart?.(e);
            }}
            style={[
              s.startBtn,
              { backgroundColor: C.accent + "18" },
            ]}
          >
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentBright }]}>Başla</Text>
          </Press>
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
  titleRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  carriedBadge: {
    paddingHorizontal: STEP.s1,
    paddingVertical: SPACING.xs / 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  moreBtn: { minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center" },
  startBtn: {
    height: 32,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.button - 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
