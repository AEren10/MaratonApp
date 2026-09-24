import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HomeStopCheckRing } from "./HomeStopCheckRing";
import { Press, PRESS_ROW } from "../../../components/design/Press";

function durationOf(item) {
  const mins = item.minutes || (item.count > 0 ? Math.round(item.count * 1.5) : null);
  return mins ? `${mins} dk` : "30 dk";
}

// Bugünün durakları satırı:
// [Dikey ders renk çubuğu] -> [Onay halkası] -> [Ders / Konu] -> [Sağda Süre + Durum]
export const HomeStopRow = React.memo(function HomeStopRow({ item, isNext, onToggle, onStart }) {
  const C = useC();
  const sid = useSubjectIdentity(item.subject);
  const subjectLabel = getSubjectByKey(item.subject)?.label || item.subject || "";
  const isDone = Boolean(item.completed);
  const tone = isDone ? C.text3 : (sid?.solid || C.text2);

  const handleToggle = useCallback(() => {
    onToggle(item);
  }, [onToggle, item]);

  const handlePress = useCallback(() => {
    if (onStart) onStart(item);
    else onToggle(item);
  }, [onStart, onToggle, item]);

  const durationStr = durationOf(item);

  const rawTopic = item.topic || item.planTopicName || item.label;
  const isDuplicate = !rawTopic
    || rawTopic.toLowerCase() === subjectLabel.toLowerCase()
    || rawTopic.toLowerCase() === (item.subject || "").toLowerCase();
  const topicTitle = isDuplicate ? "Genel çalışma" : rawTopic;

  return (
    <View
      style={[
        s.row,
        {
          backgroundColor: C.surface,
          borderColor: (isNext && !isDone) ? C.border : (isDone ? C.line : C.elev),
        },
      ]}
    >
      {/* 1. Dikey ders rengi çubuğu (tikin solunda, kompakt ve zarif) */}
      <View style={[s.bar, { backgroundColor: isDone ? C.line : tone }]} />

      {/* 2. Dairesel tik / onay halkası */}
      <HomeStopCheckRing
        done={isDone}
        isNext={isNext}
        onToggle={handleToggle}
        accessibilityLabel={`${subjectLabel} tamamlandı olarak işaretle`}
      />

      {/* 3. Metin bloğu: [DERS ADI] ve [KONU BAŞLIĞI] */}
      <Press
        onPress={handlePress}
        scaleTo={PRESS_ROW}
        accessibilityLabel={`${subjectLabel}, ${topicTitle}`}
        style={s.bodyArea}
      >
        <View style={s.flex}>
          <Text numberOfLines={1} style={[TYPOGRAPHY.label, s.sub, { color: tone }]}>
            {subjectLabel.toUpperCase()}
            {item.badge ? ` · ${String(item.badge).toUpperCase()}` : ""}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              TYPOGRAPHY.tableName,
              s.topic,
              {
                color: isDone ? C.text3 : C.text,
                textDecorationLine: isDone ? "line-through" : "none",
              },
            ]}
          >
            {topicTitle}
          </Text>
        </View>

        {/* 4. En sağ ortada: Süre (dakika) + Sıradaki göstergesi */}
        <View style={s.rightCol}>
          <Text style={[TYPOGRAPHY.tableValue, { color: isDone ? C.text3 : C.text2 }]}>
            {durationStr}
          </Text>
          {isNext && !isDone ? <View style={[s.dot, { backgroundColor: C.accent }]} /> : null}
        </View>
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    paddingLeft: STEP.s2,
    paddingRight: STEP.s3,
    paddingVertical: STEP.s2 + 2,
    gap: STEP.s2,
    minHeight: 64,
  },
  bar: {
    width: 3,
    height: 30,
    borderRadius: SHAPE.chip / 4,
  },
  bodyArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  flex: { flex: 1, minWidth: 0 },
  sub: {
    letterSpacing: 0.6,
  },
  topic: {
    marginTop: STEP.s1 / 4,
  },
  rightCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 - 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
});
