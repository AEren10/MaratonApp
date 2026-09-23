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
        <View style={[s.jewelBox, { backgroundColor: subColor + "18", borderColor: subColor + "35" }]}>
          <View style={[s.jewelDot, { backgroundColor: subColor }]} />
        </View>
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
          <View style={[s.stopBadge, { backgroundColor: C.elev, borderColor: C.border }]}>
            <Text style={[s.stopText, { color: C.text2 }]}>
              {stopLabel}
            </Text>
          </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  jewelBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  jewelDot: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  subjectLabel: {
    fontFamily: "Archivo_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
  },
  topicText: {
    fontFamily: "Bricolage_400",
    fontSize: 16.5,
    lineHeight: 21,
    marginTop: 2,
  },
  stopBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },
  stopText: {
    fontFamily: "Archivo_600SemiBold",
    fontSize: 11.5,
  },
});



