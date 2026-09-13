import { View, Text, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// "BUGÜNÜN DURAĞI 0/1" — ilk gunun tek duragi. Sure yoksa yalniz "ilk adım".
export function FirstDayStop({ task }) {
  const C = useC();
  const sid = useSubjectIdentity(task?.subject);
  if (!task) return null;

  const meta = task.estimatedMinutes ? `${task.estimatedMinutes} dakika · ilk adım` : "ilk adım";
  const subject = String(task.subjectLabel || task.subject || "").toLocaleUpperCase("tr");

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BUGÜNÜN DURAĞI</Text>
        <View style={[s.rule, { backgroundColor: C.line }]} />
        <Text style={[TYPOGRAPHY.topicName, s.count, { color: C.text3 }]}>0/1</Text>
      </View>
      <View style={[s.row, { borderTopColor: C.line }]}>
        <View style={[s.box, { borderColor: C.border }]} />
        <View style={s.flex}>
          <Text style={[TYPOGRAPHY.label, s.sub, { color: sid?.solid || C.text2 }]}>{subject}</Text>
          <Text style={[TYPOGRAPHY.topicName, s.topic, { color: C.text }]}>{task.topicLabel || task.subjectLabel}</Text>
          <Text style={[TYPOGRAPHY.micro, s.topic, { color: C.text3 }]}>{meta}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 - 2 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  count: { fontSize: TYPOGRAPHY.topicName.fontSize - 1, fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 3, paddingVertical: STEP.s3 - 2, borderTopWidth: 1 },
  box: { width: STEP.s3 + 2, height: STEP.s3 + 2, borderRadius: STEP.s1 / 2, borderWidth: 1.8 },
  flex: { flex: 1, minWidth: 0 },
  sub: { fontFamily: TYPOGRAPHY.button.fontFamily, fontSize: TYPOGRAPHY.tableHead.fontSize },
  topic: { marginTop: STEP.s1 / 2 + 1 },
});
