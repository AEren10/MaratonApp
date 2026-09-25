import React, { useCallback, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { Icon } from "../../../../components/design";
import { useC, useSubjectIdentity } from "../../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../../themes/subjects";
import { formatStudyMinutes } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../../themes/tokens";
import { Press } from "../../../../components/design/Press";

// Satira dokun duzenle, sola kaydir sil.
export const HistoryRow = React.memo(function HistoryRow({ row, last, onOpen, onDelete }) {
  const C = useC();
  const ref = useRef(null);
  const { log, minutes, meta } = row;
  const sid = useSubjectIdentity(log.subject);
  const label = getSubjectByKey(log.subject)?.label || log.subject;
  const questions = log.questionCount ?? log.question_count ?? 0;

  const open = useCallback(() => onOpen(log), [onOpen, log]);
  const remove = useCallback(() => { ref.current?.close(); onDelete(log); }, [onDelete, log]);

  const renderRight = useCallback(() => (
    <Press haptic="none" onPress={remove} accessibilityRole="button" accessibilityLabel="Sil"
      style={[styles.delete, { backgroundColor: C.brandFill }]}>
      <Icon name="trash" size={16} color={C.accentInk} />
      <Text style={[TYPOGRAPHY.micro, styles.deleteText, { color: C.accentInk }]}>Sil</Text>
    </Press>
  ), [C, remove]);

  return (
    <View style={[styles.wrap, { borderTopColor: C.line }, last && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
      <Swipeable ref={ref} renderRightActions={renderRight} overshootRight={false} friction={2} rightThreshold={40}>
        <Press haptic="none" onPress={open} accessibilityRole="button" accessibilityHint="Kaydı düzenler, sola kaydırınca silinir"
          style={[styles.row, { backgroundColor: C.bg }]}>
          <View style={[styles.dot, { backgroundColor: sid?.solid || C.text3 }]} />
          <View style={styles.flex}>
            <Text numberOfLines={1} style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>{label}</Text>
            {meta ? <Text numberOfLines={1} style={[TYPOGRAPHY.micro, styles.meta, { color: C.text3 }]}>{meta}</Text> : null}
          </View>
          <View style={styles.right}>
            <Text style={[TYPOGRAPHY.topicName, styles.num, { color: C.text }]}>{formatStudyMinutes(minutes)}</Text>
            <Text style={[TYPOGRAPHY.tableHead, styles.q, { color: C.text3 }]}>{`${questions} soru`}</Text>
          </View>
          <Icon name="chevR" size={12} color={C.text5} />
        </Press>
      </Swipeable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginHorizontal: GUTTER, borderTopWidth: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, paddingVertical: STEP.s2 + 3 },
  dot: { width: 8, height: 8, borderRadius: SHAPE.chip / 6 },
  flex: { flex: 1, minWidth: 0 },
  meta: { marginTop: STEP.s1 / 2 },
  right: { alignItems: "flex-end" },
  num: { fontSize: TYPOGRAPHY.topicName.fontSize + 1, fontVariant: ["tabular-nums"] },
  q: { letterSpacing: 0, fontFamily: TYPOGRAPHY.micro.fontFamily, marginTop: STEP.s1 / 2 - 1 },
  delete: {
    width: 76, height: 70, marginLeft: STEP.s2 + 2, alignSelf: "center", borderRadius: SHAPE.cardTight,
    alignItems: "center", justifyContent: "center", gap: STEP.s1 - 3,
  },
  deleteText: { fontFamily: TYPOGRAPHY.button.fontFamily },
});
