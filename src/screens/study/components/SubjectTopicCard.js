import { View, Text } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

// Tasarım: ders + konu satırı, sağda durak sırası (varsa).
export function SubjectTopicCard({ C, subject, topic, stopLabel }) {
  const subjectName = subject.label || subject.name || "";
  const isDuplicate = !topic
    || topic.trim().toLowerCase() === subjectName.trim().toLowerCase()
    || topic.trim().toLowerCase() === (subject.key || "").trim().toLowerCase();
  const displayTopic = isDuplicate ? "Genel çalışma" : topic;

  return (
    <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s2 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: STEP.s2,
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.elev,
          borderRadius: 16,
        }}
      >
        <View
          style={{
            width: 3,
            height: 28,
            borderRadius: 2,
            backgroundColor: subject.color || C.accent,
          }}
        />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[TYPOGRAPHY.label, { color: subject.color || C.accent, letterSpacing: 0.8 }]}
            numberOfLines={1}
          >
            {subjectName.toLocaleUpperCase("tr")}
          </Text>
          <Text
            style={[
              TYPOGRAPHY.topicName,
              { color: C.text, fontSize: 15.5, lineHeight: 20, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {displayTopic}
          </Text>
        </View>
        {stopLabel ? (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, fontSize: 12 }]}>{stopLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
