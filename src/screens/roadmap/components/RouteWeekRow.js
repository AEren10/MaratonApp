import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { subjectColorOf } from "../../../themes/subjectPalette";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function RouteWeekRow({ C, week, index, isFirst, isLast, rangeLabel }) {
  const stopCount = week.stops?.length || 0;
  const topics = (week.stops || []).map((s) => s.topic).filter(Boolean);
  const subjects = Array.from(new Set((week.stops || []).map((s) => s.subject).filter(Boolean)));
  const weekTitle = isFirst ? "BU HAFTA" : `${week.weekNo || index + 1}. HAFTA`;

  let topicText = null;
  if (topics.length > 0) {
    if (topics.length <= 2) {
      topicText = topics.join(", ");
    } else {
      topicText = `${topics.slice(0, 2).join(", ")} +${topics.length - 2}`;
    }
  }

  return (
    <View style={s.itemRow}>
      {/* Sol Zaman Çizgisi */}
      <View style={s.nodeCol}>
        <View
          style={[
            s.node,
            {
              backgroundColor: isFirst ? C.accent : C.void,
              borderColor: isFirst ? C.accentBright : C.border,
            },
          ]}
        />
        {!isLast ? <View style={[s.trackLine, { backgroundColor: C.line }]} /> : null}
      </View>

      {/* Kutusuz bilgi satırı — haftalar arası 1px çizgi */}
      <View style={[s.content, !isLast && { borderBottomWidth: 1, borderBottomColor: C.line }]}>
        <View style={s.cardTop}>
          <View style={s.weekMeta}>
            <Text style={[TYPOGRAPHY.label, { color: isFirst ? C.accentBright : C.text2 }]}>
              {weekTitle}
            </Text>
            {rangeLabel ? (
              <Text style={[TYPOGRAPHY.micro, s.rangeText, { color: C.text3 }]}>
                {rangeLabel}
              </Text>
            ) : null}
          </View>
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>
            {`${stopCount} durak`}
          </Text>
        </View>

        {topicText ? (
          <View style={s.topicRow}>
            {subjects.length > 0 ? (
              <View style={s.subjectsRow}>
                {subjects.map((subKey) => (
                  <View
                    key={subKey}
                    style={[s.subjectDot, { backgroundColor: subjectColorOf(C, subKey) }]}
                  />
                ))}
              </View>
            ) : null}
            <Text numberOfLines={1} style={[TYPOGRAPHY.caption, s.topicText, { color: C.text }]}>
              {topicText}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    gap: STEP.s2,
  },
  nodeCol: {
    alignItems: "center",
    width: 16,
    paddingTop: STEP.s2,
  },
  node: {
    width: 10,
    height: 10,
    borderRadius: SHAPE.chip / 2,
    borderWidth: 2,
    zIndex: 1,
  },
  trackLine: {
    flex: 1,
    width: 2,
    marginTop: STEP.s1 / 2,
  },
  content: {
    flex: 1,
    paddingVertical: STEP.s2,
    gap: STEP.s1 / 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  rangeText: {
    letterSpacing: 0,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  subjectsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 2,
  },
  subjectDot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
  topicText: {
    flex: 1,
  },
});
