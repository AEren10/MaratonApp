import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC, useSubjectIdentity } from "../../../contexts/ThemeContext";
import { getSubjectByKey } from "../../../themes/subjects";
import { SHAPE, STEP, TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { HomeStopCheckRing } from "./HomeStopCheckRing";
import { Press, PRESS_ROW } from "../../../components/design/Press";
import { HomeStopRowTrail } from "./HomeStopRowTrail";

function durationOf(item) {
  const mins = item.minutes || (item.count > 0 ? Math.round(item.count * 1.5) : null);
  return mins ? `${mins} dk` : "30 dk";
}

// Bugünün durakları satırı:
// [Dikey ders renk çubuğu] -> [Onay halkası] -> [Ders / Konu] -> [Sağda Süre + Durum]
export const HomeStopRow = React.memo(function HomeStopRow({ item, isNext, onToggle, onStart, onOpenMenu, onEdit }) {
  const C = useC();
  const sid = useSubjectIdentity(item.subject);
  const isTrial = item.source === "trial";
  // Tam deneme bir derse ait degil: etiket "Deneme"; brans denemesinde ders.
  const subjectLabel = isTrial && !item.subject ? "Deneme" : getSubjectByKey(item.subject)?.label || item.subject || "";
  const editable = isTrial ? null : onEdit;
  const isDone = Boolean(item.completed);
  const tone = isDone ? C.text3 : (sid?.solid || C.text2);

  const handleToggle = useCallback(() => {
    onToggle(item);
  }, [onToggle, item]);

  // Bitmis duraga dokunmak kaydi acar (sure/soru duzeltilir); acik durak baslar.
  const handlePress = useCallback(() => {
    if (item.completed && editable) editable(item);
    else if (onStart) onStart(item);
    else onToggle(item);
  }, [onStart, onToggle, editable, item]);

  const durationStr = durationOf(item);
  const rawTopic = item.topic || item.planTopicName || item.label;
  const isDuplicate = !rawTopic
    || rawTopic.toLowerCase() === subjectLabel.toLowerCase()
    || rawTopic.toLowerCase() === (item.subject || "").toLowerCase();
  const topicTitle = isDuplicate ? "Genel çalışma" : rawTopic;

  const isCarried = Boolean(item.reason && String(item.reason).startsWith("Bu haftadan kalan"));
  const canPostpone = !isDone && Boolean(item.logicalStopKey) && !String(item.logicalStopKey).startsWith("habit:");

  return (
    <View
      // Kutusuz (Ders analizi deseni): zemin ve cerceve yok, satirlar ince
      // ayracla ayrilir; siradaki durak ders rengi cubugu ve kizil noktayla.
      style={[s.row, { borderBottomColor: C.line }]}
    >
      <View style={[s.bar, { backgroundColor: isDone ? C.line : tone }]} />

      <HomeStopCheckRing
        done={isDone}
        isNext={isNext}
        onToggle={handleToggle}
        accessibilityLabel={isDone ? `${subjectLabel} tikini geri al` : `${subjectLabel} tamamlandı olarak işaretle`}
      />

      <Press
        onPress={handlePress}
        scaleTo={PRESS_ROW}
        accessibilityLabel={`${subjectLabel}, ${topicTitle}`}
        style={s.bodyArea}
      >
        <View style={s.flex}>
          <View style={s.labelRow}>
            <Text numberOfLines={1} style={[TYPOGRAPHY.label, s.sub, { color: tone }]}>
              {subjectLabel.toUpperCase()}
              {item.badge ? ` · ${String(item.badge).toUpperCase()}` : ""}
            </Text>
            {isCarried ? (
              <View style={[s.carriedBadge, { backgroundColor: C.void, borderColor: C.line }]}>
                <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Bu haftadan</Text>
              </View>
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
            {topicTitle}
          </Text>
        </View>

        <HomeStopRowTrail
          duration={durationStr}
          isDone={isDone}
          isNext={isNext}
          canPostpone={canPostpone}
          onMenu={() => onOpenMenu?.(item)}
          onEdit={editable ? () => editable(item) : null}
        />
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingVertical: STEP.s2,
    gap: STEP.s2,
    minHeight: 64,
  },
  bar: { width: 3, height: 30, borderRadius: SHAPE.chip },
  bodyArea: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: STEP.s2 },
  flex: { flex: 1, minWidth: 0 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  carriedBadge: {
    paddingHorizontal: STEP.s1,
    paddingVertical: SPACING.xs / 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  sub: { letterSpacing: 0.6 },
  topic: { marginTop: STEP.s1 / 4 },
});
