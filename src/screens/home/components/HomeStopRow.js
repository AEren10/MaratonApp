import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

function metaOf(item) {
  const est = item.count > 0 ? Math.round(item.count * 1.2) : 0;
  return [item.count > 0 ? `${item.count} soru` : null, est > 0 ? `~${est} dk` : null, item.badge || null]
    .filter(Boolean).join(" · ");
}

// Bugünün durakları satırı. Figma referansına (media_1789650533819.png) birebir:
// [Dikey ders renk çubuğu] -> [Tik/onay halkası] -> [Ders / Konu / Meta] -> [Kırmızı nokta (sıradaki)]
export const HomeStopRow = React.memo(function HomeStopRow({ item, isNext, onToggle, onStart }) {
  const C = useC();
  const sid = useSubjectIdentity(item.subject);
  const subjectLabel = getSubjectByKey(item.subject)?.label || item.subject || "";
  const done = item.completed;
  const tone = done ? C.text3 : (sid?.solid || C.text2);
  const toggle = useCallback(() => onToggle(item), [onToggle, item]);
  const handlePress = useCallback(() => {
    if (onStart) onStart(item);
    else onToggle(item);
  }, [onStart, onToggle, item]);
  const meta = metaOf(item);

  return (
    <View
      style={[s.row, {
        backgroundColor: isNext ? C.brandTint : C.surface,
        borderColor: isNext ? C.bandEdge : (done ? C.line : C.elev),
      }]}
    >
      {/* 1. Dikey ders rengi çubuğu (tikin solunda) */}
      <View style={[s.bar, { backgroundColor: tone }]} />

      {/* 2. Dairesel tik / onay halkası */}
      <Pressable
        onPress={toggle}
        hitSlop={STEP.s2}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={`${subjectLabel} tamamlandı olarak işaretle`}
        style={s.checkArea}
      >
        <View
          style={[
            s.ring,
            {
              borderColor: done ? C.up : (isNext ? C.accent : C.text5),
              backgroundColor: done ? C.up : "transparent",
            },
          ]}
        >
          {done ? <Icon name="check" size={13} color={C.bg} sw={2.8} /> : null}
        </View>
      </Pressable>

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
          <Text numberOfLines={1} style={[TYPOGRAPHY.topicName, s.topic, { color: done ? C.text3 : C.text }]}>
            {item.label}
          </Text>
          {meta ? (
            <Text numberOfLines={1} style={[TYPOGRAPHY.micro, s.meta, { color: C.text3 }]}>
              {meta}
            </Text>
          ) : null}
        </View>
        {isNext ? <View style={[s.dot, { backgroundColor: C.accent }]} /> : null}
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
  checkArea: {
    width: STEP.s4 + 2,
    height: STEP.s4 + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: STEP.s3 + 6,
    height: STEP.s3 + 6,
    borderRadius: (STEP.s3 + 6) / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
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
