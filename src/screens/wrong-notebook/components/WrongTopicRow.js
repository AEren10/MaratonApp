import { memo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { GROUP_STATE } from "../../../domain/wrongNotebook/wrongTopicGroups";
import { REVIEW_LADDER } from "../../../lib/wrongReviewLadder";
import { getSubjectByKey } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";
import { alpha } from "../../../themes/colorMix";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { WrongThumb } from "./WrongThumb";

function pillOf(group, C) {
  switch (group.state) {
    case GROUP_STATE.TODAY: return { text: "TEKRAR ZAMANI", color: C.warn, bg: alpha(C.warn, 14), bd: "transparent" };
    case GROUP_STATE.DONE: return { text: "KAPATILDI", color: C.up, bg: alpha(C.up, 14), bd: "transparent" };
    case GROUP_STATE.NEW: return { text: "YENİ", color: C.text2, bg: "transparent", bd: C.line };
    default: return { text: `${group.days} GÜN SONRA`, color: C.text3, bg: "transparent", bd: C.line };
  }
}

export const WrongTopicRow = memo(function WrongTopicRow({ group, onPress }) {
  const C = useC();
  const pill = pillOf(group, C);
  const subjectLabel = getSubjectByKey(group.subjectKey)?.label || group.subjectKey;
  const done = group.state === GROUP_STATE.DONE;

  return (
    <Pressable
      onPress={() => onPress(group)}
      accessibilityRole="button"
      accessibilityLabel={`${group.topic}, ${subjectLabel}, ${group.count} soru, ${pill.text}`}
      style={({ pressed }) => [styles.row, { borderTopColor: C.line }, pressed && { backgroundColor: C.surfacePressed }]}
    >
      <WrongThumb color={subjectColorOf(C, group.subjectKey)} />
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.topicName, { color: done ? C.text3 : C.text }]} numberOfLines={2}>
          {group.topic}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>
          {subjectLabel} · {group.count} soru
        </Text>
        <View style={styles.meta}>
          <View style={[styles.pill, { backgroundColor: pill.bg, borderColor: pill.bd }]}>
            <Text style={[TYPOGRAPHY.tableHead, styles.pillText, { color: pill.color }]}>{pill.text}</Text>
          </View>
          <View style={styles.dashes}>
            {REVIEW_LADDER.map((_, i) => (
              <View key={i} style={[styles.dash, { backgroundColor: i < group.stage ? pill.color : C.track }]} />
            ))}
          </View>
        </View>
      </View>
      <Icon name="chevR" size={12} color={C.text5} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2,
    borderTopWidth: 1,
    minHeight: CONTROL.tapMin,
  },
  body: { flex: 1, minWidth: 0 },
  meta: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginTop: STEP.s1 },
  pill: {
    height: 21,
    paddingHorizontal: STEP.s1,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    justifyContent: "center",
  },
  pillText: { fontFamily: TYPOGRAPHY.button.fontFamily },
  dashes: { flexDirection: "row", gap: 4 },
  dash: { width: 14, height: 3, borderRadius: 1 },
});
