import { View, Text } from "react-native";

import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

// Tasarım: ders + konu satırı, sağda durak sırası (varsa).
export function SubjectTopicCard({ C, subject, topic, stopLabel }) {
  return (
    <View style={{ width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s2 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingVertical: 16,
          paddingHorizontal: 18,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.elev,
          borderRadius: 20,
        }}
      >
        <View style={{ width: 9, height: 9, borderRadius: 1, backgroundColor: subject.color }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[TYPOGRAPHY.label, { color: subject.color, letterSpacing: 1.8 }]}
            numberOfLines={1}
          >
            {(subject.label || subject.name || "").toLocaleUpperCase("tr")}
          </Text>
          {topic ? (
            <Text
              style={[
                TYPOGRAPHY.topicName,
                { color: C.text, fontSize: 16.5, lineHeight: 22, marginTop: 4 },
              ]}
              numberOfLines={1}
            >
              {topic}
            </Text>
          ) : null}
        </View>
        {stopLabel ? (
          <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, fontSize: 12 }]}>{stopLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
