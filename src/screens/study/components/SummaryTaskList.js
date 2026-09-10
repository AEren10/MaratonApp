import { View, Text, StyleSheet } from "react-native";

import { SectionLabel, Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

function TaskRow({ task, C }) {
  const color = C.subjects[task.subject] || C.text3;
  return (
    <Card tone="surface" style={styles.row}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <View style={styles.flex}>
        <Text style={[TYPOGRAPHY.label, { color, marginBottom: 0 }]}>
          {(task.subject || "").toUpperCase()}
        </Text>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, marginTop: STEP.s1 }]} numberOfLines={1}>
          {task.topic || "Konu belirtilmedi"}
        </Text>
      </View>
      <View style={styles.meta}>
        <Text style={[TYPOGRAPHY.meta, { color: C.text2 }]}>{task.duration} dk</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 }]}>{task.questionCount} soru</Text>
      </View>
    </Card>
  );
}

export function SummaryTaskList({ tasks }) {
  const C = useC();
  if (!tasks?.length) return null;

  return (
    <View style={styles.wrap}>
      <SectionLabel>GÜNÜN İŞLERİ</SectionLabel>
      <View style={styles.list}>
        {tasks.map((task) => (
          <TaskRow key={task.key} task={task} C={C} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: STEP.s5, paddingHorizontal: GUTTER },
  list: { gap: STEP.s1, marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, padding: STEP.s2 },
  bar: { width: 3, alignSelf: "stretch", minHeight: 44, borderRadius: 2 },
  flex: { flex: 1, minWidth: 0 },
  meta: { alignItems: "flex-end" },
});
