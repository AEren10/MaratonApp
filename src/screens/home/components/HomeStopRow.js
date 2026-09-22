import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HomeStopCheckRing } from "./HomeStopCheckRing";

function metaOf(item) {
  const mins = item.minutes || (item.count > 0 ? Math.round(item.count * 1.5) : null);
  const timeStr = mins ? `${mins} dk` : null;
  return [timeStr, item.badge || null].filter(Boolean).join(" · ");
}

// Bugünün durakları satırı:
// [Dikey ders renk çubuğu] -> [Yaylı tik halkası] -> [Ders · Süre / Konu] -> [Kırmızı nokta (sıradaki)]
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

  const meta = metaOf(item);

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

      {/* 3. Metin bloğu: [DERS · SÜRE] ve [KONU BAŞLIĞI] */}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${subjectLabel}, ${item.label}`}
        style={s.bodyArea}
      >
        <View style={s.flex}>
          <View style={s.subRow}>
            <Text numberOfLines={1} style={[TYPOGRAPHY.label, s.sub, { color: tone }]}>
              {subjectLabel}
            </Text>
            {meta ? (
              <Text numberOfLines={1} style={[TYPOGRAPHY.micro, { color: C.text3 }]}>
                {`·  ${meta}`}
              </Text>
            ) : null}
          </View>
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
            {item.label}
          </Text>
        </View>
        {isNext && !isDone ? <View style={[s.dot, { backgroundColor: C.accent }]} /> : null}
      </Pressable>
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
    paddingRight: STEP.s2 + 2,
    paddingVertical: STEP.s2,
    gap: STEP.s2,
    minHeight: 56,
  },
  bar: {
    width: 3,
    height: 26,
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
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 - 2,
  },
  sub: {
    letterSpacing: 0.6,
  },
  topic: {
    marginTop: STEP.s1 / 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: SHAPE.chip / 2,
  },
});
