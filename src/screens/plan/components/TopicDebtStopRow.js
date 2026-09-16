import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { getSubjectByKey } from "../../../themes/subjects";
import { subjectColorOf } from "../../../themes/subjectPalette";

export const TopicDebtStopRow = React.memo(function TopicDebtStopRow({ item, C }) {
  const color = subjectColorOf(C, item.subjectKey);
  const subjectLabel = getSubjectByKey(item.subjectKey)?.label || item.subjectKey;
  
  const title = item.title || \\ · \\;
  const meta = item.hours ? \tlandı · \ sa\ : \\ · \\;
  const rightText = item.hours ? \\sa\ : item.dueLabel;

  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>
          {meta}
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]} allowFontScaling={false}>
        {rightText}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },
  dot: { width: 8, height: 8, borderRadius: 2 },
  body: { flex: 1, minWidth: 0 },
});
