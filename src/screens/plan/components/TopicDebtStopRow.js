import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Tasarim: ders renkli 8px kare + "Ders · Konu" + "atlandı · N sa" + sagda saat.
export const TopicDebtStopRow = React.memo(function TopicDebtStopRow({ item, C }) {
  const color = C.subjects?.[item.subjectKey] || C.accent;
  return (
    <View style={[styles.row, { borderTopColor: C.line }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]}>
          atlandı · {item.hours} sa
        </Text>
      </View>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]} allowFontScaling={false}>
        {item.hours}sa
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  dot: { width: 8, height: 8, borderRadius: 1 },
  body: { flex: 1, minWidth: 0 },
});
