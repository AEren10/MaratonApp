import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { HomeStopCheckRing } from "./HomeStopCheckRing";

function metaOf(item) {
  const est = item.count > 0 ? Math.round(item.count * 1.2) : 0;
  return [item.count > 0 ? `${item.count} soru` : null, est > 0 ? `~${est} dk` : null, item.badge || null]
    .filter(Boolean).join(" · ");
}

// Bugünün durakları satırı. Figma referansına (media_1789650533819.png) birebir:
// [Dikey ders renk çubuğu] -> [Yaylı tik halkası] -> [Ders / Konu / Meta] -> [Kırmızı nokta (sıradaki)]
export const HomeStopRow = React.memo(function HomeStopRow({ item, isNext, onToggle, onStart, onChecked }) {
  const C = useC();
  const sid = useSubjectIdentity(item.subject);
  const subjectLabel = getSubjectByKey(item.subject)?.label || item.subject || "";
  const done = item.completed;
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (done) setChecking(false);
  }, [done]);

  const isDone = done || checking;
  const tone = isDone ? C.text3 : (sid?.solid || C.text2);

  const handleToggle = useCallback(() => {
    onToggle(item);
  }, [onToggle, item]);

  const handleChecked = useCallback(() => {
    setChecking(true);
    onChecked?.();
  }, [onChecked]);

  const handlePress = useCallback(() => {
    if (onStart) onStart(item);
    else onToggle(item);
  }, [onStart, onToggle, item]);

  const meta = metaOf(item);

  return (
    <View
      style={[s.row, {
        backgroundColor: (isNext && !isDone) ? C.brandTint : C.surface,
        borderColor: (isNext && !isDone) ? C.bandEdge : (isDone ? C.line : C.elev),
      }]}
    >
      {/* 1. Dikey ders rengi çubuğu (tikin solunda) */}
      <View style={[s.bar, { backgroundColor: tone }]} />

      {/* 2. Yaylı animasyonlu dairesel tik / onay halkası */}
      <HomeStopCheckRing
        done={done}
        isNext={isNext}
        onToggle={handleToggle}
        onChecked={handleChecked}
        accessibilityLabel={`${subjectLabel} tamamlandı olarak işaretle`}
      />

      {/* 3. Metin bloğu: Ders, Konu, Soru/Süre bilgisi */}
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`${subjectLabel}, ${item.label}`}
        style={s.bodyArea}
      >
        <View style={s.flex}>
          <Text numberOfLines={1} style={[TYPOGRAPHY.label, s.sub, { color: tone }]}>
            {subjectLabel}
          </Text>
          <Text
            numberOfLines={1}
            style={[
              TYPOGRAPHY.topicName,
              s.topic,
              {
                color: isDone ? C.text3 : C.text,
                textDecorationLine: isDone ? "line-through" : "none",
              },
            ]}
          >
            {item.label}
          </Text>
          {meta ? (
            <Text numberOfLines={1} style={[TYPOGRAPHY.micro, s.meta, { color: C.text3 }]}>
              {meta}
            </Text>
          ) : null}
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
    borderRadius: SHAPE.card,
    borderWidth: 1,
    paddingLeft: STEP.s2,
    paddingRight: STEP.s3,
    paddingVertical: STEP.s2 + 2,
    gap: STEP.s2,
  },
  bar: {
    width: 3.5,
    height: STEP.s4 + 4,
    borderRadius: SHAPE.chip / 3,
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
    letterSpacing: 0,
    textTransform: "none",
  },
  topic: {
    marginTop: STEP.s1 / 4,
  },
  meta: {
    marginTop: STEP.s1 / 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: SHAPE.chip / 2,
  },
});
