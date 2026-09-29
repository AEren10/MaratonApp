import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { TYPOGRAPHY, STEP, SHAPE, SPACING } from "../../../themes/tokens";
import { subjectColorOf } from "../../../themes/subjectPalette";

export function SelectedDayStopRow({ log, isLast, isDraft, C, onPress, onOpenMenu }) {
  const isDone = log.status === "done" || log.completed;
  const dotColor = subjectColorOf(C, log.subjectKey || log.subjectLabel);
  const isRowDraft = Boolean(log.draft || isDraft);

  return (
    <Pressable onPress={onPress} style={[s.timelineRow, isRowDraft && s.draftRow]}>
      <View style={s.timeCol}>
        <Text style={[TYPOGRAPHY.tableName, s.tabular, { color: C.text }]}>{log.time || "—"}</Text>
      </View>

      <View style={s.lineTrack}>
        <View style={[s.dot, { backgroundColor: dotColor }]} />
        {!isLast ? <View style={[s.vertLine, { backgroundColor: C.line }]} /> : null}
      </View>

      <View style={[s.stopCard, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={s.cardHead}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text, flex: 1 }]} numberOfLines={1}>
            <Text style={{ color: dotColor }}>{log.subjectLabel}</Text>
            {log.topic ? ` · ${log.topic}` : ""}
          </Text>
          {isDone ? (
            <View style={s.doneBadge}>
              <Icon name="check" size={12} color={C.text2} sw={1.5} />
              <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>Bitti</Text>
            </View>
          ) : log.source === "habit" ? (
            <View style={[s.habitBadge, { backgroundColor: C.void, borderColor: C.line }]}>
              <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Günlük rutin</Text>
            </View>
          ) : (
            <View style={s.rightActions}>
              {log.minutes ? (
                <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${log.minutes} dk`}</Text>
              ) : null}
              {log.movable ? (
                <Press
                  haptic="light"
                  onPress={() => onOpenMenu?.(log)}
                  hitSlop={12}
                  style={s.moreBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Durak seçenekleri"
                >
                  <Icon name="more" size={14} color={C.text3} />
                </Press>
              ) : null}
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  timelineRow: { flexDirection: "row", alignItems: "stretch", gap: STEP.s1, marginBottom: STEP.s2 },
  draftRow: { opacity: 0.6 },
  timeCol: { width: 44, alignItems: "flex-start", paddingTop: SPACING.xs },
  tabular: { fontVariant: ["tabular-nums"] },
  lineTrack: { width: 14, alignItems: "center", paddingTop: STEP.s1 },
  dot: { width: 10, height: 10, borderRadius: SHAPE.chip },
  vertLine: { width: 1.5, flex: 1, marginTop: SPACING.xs },
  stopCard: { flex: 1, padding: STEP.s2, borderRadius: SHAPE.cardTight, borderWidth: 1 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  habitBadge: { paddingHorizontal: STEP.s1, paddingVertical: SPACING.xs, borderRadius: SHAPE.chip, borderWidth: 1 },
  rightActions: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  moreBtn: { minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center" },
});
