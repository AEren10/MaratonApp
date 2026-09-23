import { View, Text, StyleSheet } from "react-native";

import { STEP, GUTTER } from "../../../themes/tokens";

export function SubjectTopicCard({ C, subject, topic, stopLabel }) {
  const subjectName = subject?.label || subject?.name || "";
  const isDuplicate = !topic
    || topic.trim().toLowerCase() === subjectName.trim().toLowerCase()
    || topic.trim().toLowerCase() === (subject?.key || "").trim().toLowerCase();
  const displayTopic = isDuplicate ? "Genel Çalışma" : topic;
  const subColor = subject?.color || C.accent;

  return (
    <View style={s.wrap}>
      <View style={[s.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
        <View style={[s.jewelDot, { backgroundColor: subColor }]} />
        <View style={s.content}>
          <Text
            style={[s.subjectLabel, { color: subColor }]}
            numberOfLines={1}
          >
            {subjectName.toLocaleUpperCase("tr")}
          </Text>
          <Text
            style={[s.topicText, { color: C.text }]}
            numberOfLines={1}
          >
            {displayTopic}
          </Text>
        </View>
        {stopLabel ? (
          <Text style={[s.stopText, { color: C.text3 }]}>
            {stopLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingHorizontal: GUTTER,
    marginTop: STEP.s2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  jewelDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subjectLabel: {
    fontFamily: "Archivo_700Bold",
    fontSize: 11.5,
    letterSpacing: 1.5,
  },
  topicText: {
    fontFamily: "Bricolage_400",
    fontSize: 16.5,
    lineHeight: 21,
    marginTop: 3,
  },
  stopText: {
    fontFamily: "Archivo_500Medium",
    fontSize: 12,
    flexShrink: 0,
  },
});


