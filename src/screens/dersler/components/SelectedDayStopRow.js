import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, SHAPE, SPACING, CONTROL } from "../../../themes/tokens";
import { subjectColorOf } from "../../../themes/subjectPalette";

// Program > Hafta durak satiri. Kutusuz: zaman cizgisi noktasi · konu.
// Listede saatli calisma kaydi varsa time sutunu aktiflesir, yoksa nokta en solda durur.
export function SelectedDayStopRow({ log, isLast, isDraft, C, showTime, onPress, onOpenMenu }) {
  const isDone = log.status === "done" || log.completed;
  const dotColor = subjectColorOf(C, log.subjectKey || log.subjectLabel);
  const habit = log.source === "habit";
  const name = log.topic || log.subjectLabel;
  const subjectLine = log.topic ? log.subjectLabel : null;
  const habitLine = habit ? "Günlük rutin" : null;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[s.row, (log.draft || isDraft) && s.draft]}>
      {showTime ? (
        <Text style={[TYPOGRAPHY.metaSemiBold, s.time, { color: C.text3 }]}>{log.time || ""}</Text>
      ) : null}

      <View style={s.track}>
        <View style={[s.dot, { backgroundColor: isDone ? C.up : dotColor }]} />
        {!isLast ? <View style={[s.line, { backgroundColor: C.line }]} /> : null}
      </View>

      <View style={s.body}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: isDone ? C.text3 : C.text }]} numberOfLines={1}>{name}</Text>
        {/* Ders adi kendi renginde (biten durakta soluk): liste renksiz ve
            ayirt edilmesi zordu. Ders rengi yalniz ders baglaminda. */}
        {subjectLine || habitLine ? (
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]} numberOfLines={1}>
            {subjectLine ? <Text style={{ color: isDone ? C.text3 : dotColor }}>{subjectLine}</Text> : null}
            {subjectLine && habitLine ? " · " : null}
            {habitLine}
          </Text>
        ) : null}
      </View>

      {isDone ? (
        <View style={s.done}>
          <Icon name="check" size={12} color={C.up} sw={1.8} />
          <Text style={[TYPOGRAPHY.meta, { color: C.up }]}>Bitti</Text>
        </View>
      ) : log.minutes ? (
        <Text style={[TYPOGRAPHY.metaSemiBold, s.tabular, { color: C.text3 }]}>{`${log.minutes} dk`}</Text>
      ) : null}
      {!isDone && log.movable ? (
        <Press
          haptic="light"
          onPress={() => onOpenMenu?.(log)}
          style={s.more}
          accessibilityRole="button"
          accessibilityLabel="Durak seçenekleri"
        >
          <Icon name="more" size={16} color={C.text3} fill={C.text3} />
        </Press>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "stretch", gap: STEP.s2, minHeight: CONTROL.tapMin + STEP.s2 },
  draft: { opacity: 0.6 },
  time: { width: 40, paddingTop: 10, fontVariant: ["tabular-nums"] },
  track: { width: 16, alignItems: "center", paddingTop: 15 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  line: { width: 1, flex: 1, marginTop: SPACING.xs },
  body: { flex: 1, paddingVertical: STEP.s1, paddingBottom: STEP.s2 },
  done: { flexDirection: "row", alignItems: "center", gap: SPACING.xs, alignSelf: "flex-start", paddingTop: 10 },
  tabular: { fontVariant: ["tabular-nums"], alignSelf: "flex-start", paddingTop: 10 },
  more: { width: CONTROL.tapMin, height: CONTROL.tapMin, marginRight: -STEP.s2, alignItems: "center", justifyContent: "center" },
});
