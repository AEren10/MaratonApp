import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";

// "BUGÜN İLK İŞİN" karti — rota daha olusmadan onizlenen ilk durak.
export default function RouteReadyFirstTask({ task }) {
  const C = useC();
  const identity = useSubjectIdentity(task.subjectKey);
  const color = identity?.solid || C.accent;

  return (
    <View>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BUGÜN İLK İŞİN</Text>
      <View style={[styles.card, { backgroundColor: C.brandTint, borderColor: C.border }]}>
        <View style={[styles.bar, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={[TYPOGRAPHY.micro, { color }]}>{task.subjectLabel}</Text>
          <Text style={[TYPOGRAPHY.topicName, styles.topic, { color: C.text }]} numberOfLines={1}>
            {task.topicName}
          </Text>
          <Text style={[TYPOGRAPHY.meta, styles.meta, { color: C.text3 }]}>
            {`${task.questions} soru · ~${task.minutes} dk · 1. durak`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2,
    marginTop: STEP.s2, padding: STEP.s2 + 4, borderRadius: SHAPE.card, borderWidth: 1,
  },
  bar: { width: 3, alignSelf: "stretch", minHeight: 44, borderRadius: 2 },
  topic: { marginTop: 4 },
  meta: { marginTop: 5 },
});
