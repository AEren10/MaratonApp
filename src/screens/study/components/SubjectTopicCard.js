import { View, Text } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

// Tasarım: ders + konu satırı, sağda durak sırası (varsa).
export function SubjectTopicCard({ C, subject, topic, stopLabel }) {
  return (
    <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s3 }}>
      <Card tone="surface" style={{ flexDirection: "row", alignItems: "center", gap: STEP.s2 }}>
        <View style={{ width: 9, height: 9, borderRadius: 1, backgroundColor: subject.color }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[TYPOGRAPHY.label, { color: subject.color }]} numberOfLines={1}>
            {(subject.label || subject.name || "").toUpperCase()}
          </Text>
          {topic ? (
            <Text style={[TYPOGRAPHY.topicName, { color: C.text, marginTop: STEP.s1 / 2 }]} numberOfLines={1}>
              {topic}
            </Text>
          ) : null}
        </View>
        {stopLabel ? (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>{stopLabel}</Text>
        ) : null}
      </Card>
    </View>
  );
}
