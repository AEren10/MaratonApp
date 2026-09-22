import { View, Text, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function SubjectTopicCard({ C, subject, topic, stopLabel }) {
  const subjectName = subject?.label || subject?.name || "";
  const isDuplicate = !topic
    || topic.trim().toLowerCase() === subjectName.trim().toLowerCase()
    || topic.trim().toLowerCase() === (subject?.key || "").trim().toLowerCase();
  const displayTopic = isDuplicate ? "Genel Çalışma" : topic;
  const subColor = subject?.color || C.accent;

  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={[s.accentBar, { backgroundColor: subColor }]} />
        <View style={s.content}>
          <Text
            style={[TYPOGRAPHY.label, { color: subColor, fontSize: 11, letterSpacing: 1.2 }]}
            numberOfLines={1}
          >
            {subjectName.toLocaleUpperCase("tr")}
          </Text>
          <Text
            style={[
              TYPOGRAPHY.topicName,
              { color: C.text, fontSize: 15.5, lineHeight: 21, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {displayTopic}
          </Text>
        </View>
        {stopLabel ? (
          <View style={[s.stopBadge, { backgroundColor: C.elev, borderColor: C.border }]}>
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2, fontSize: 11.5 }]}>
              {stopLabel}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", paddingHorizontal: GUTTER, marginTop: STEP.s2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  accentBar: {
    width: 3.5,
    height: 30,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  stopBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
});

