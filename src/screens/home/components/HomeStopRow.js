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

// Bugunun duraklari satiri. Satira dokunmak isaretler; siradaki durakta
// kucuk kizil nokta. Tamamlanan satir sonuk, halka yesil dolar.
export const HomeStopRow = React.memo(function HomeStopRow({ item, isNext, onToggle }) {
  const C = useC();
  const sid = useSubjectIdentity(item.subject);
  const subjectLabel = getSubjectByKey(item.subject)?.label || item.subject || "";
  const done = item.completed;
  const tone = done ? C.text4 : (sid?.solid || C.text2);
  const toggle = useCallback(() => onToggle(item), [onToggle, item]);
  const meta = metaOf(item);

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`${subjectLabel}, ${item.label}`}
      style={[s.row, {
        backgroundColor: done ? "transparent" : (isNext ? C.brandTint : C.surface),
        borderColor: done ? C.line : (isNext ? C.bandEdge : C.elev),
      }]}
    >
      <View style={[s.bar, { backgroundColor: tone }]} />
      <View style={[s.ring, { borderColor: done ? C.up : (isNext ? C.accent : C.text5), backgroundColor: done ? C.up : "transparent" }]}>
        {done ? <Icon name="check" size={14} color={C.bg} sw={2.6} /> : null}
      </View>
      <View style={s.flex}>
        <Text numberOfLines={1} style={[TYPOGRAPHY.label, s.sub, { color: tone }]}>
          {subjectLabel.toLocaleUpperCase("tr")}
        </Text>
        <Text style={[TYPOGRAPHY.topicName, s.topic, { color: done ? C.text3 : C.text }]}>{item.label}</Text>
        {meta ? <Text numberOfLines={1} style={[TYPOGRAPHY.micro, s.meta, { color: C.text3 }]}>{meta}</Text> : null}
      </View>
      {isNext ? <View style={[s.dot, { backgroundColor: C.accent }]} /> : null}
    </Pressable>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2,
    paddingVertical: STEP.s2 + 1, paddingHorizontal: STEP.s2 + 4, borderRadius: SHAPE.card, borderWidth: 1,
  },
  bar: { width: 3, alignSelf: "stretch", minHeight: STEP.s5 - 6, borderRadius: SHAPE.chip / 3 },
  ring: { width: STEP.s4 - 4, height: STEP.s4 - 4, borderRadius: SHAPE.phone, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  flex: { flex: 1, minWidth: 0 },
  sub: { fontFamily: TYPOGRAPHY.button.fontFamily },
  topic: { marginTop: STEP.s1 / 2 - 1, fontSize: TYPOGRAPHY.topicName.fontSize + 0.5 },
  meta: { marginTop: STEP.s1 / 2, fontSize: TYPOGRAPHY.micro.fontSize + 0.5 },
  dot: { width: 6, height: 6, borderRadius: SHAPE.chip / 2 },
});
