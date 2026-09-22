import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { formatMinutes } from "../../../lib/format";
import * as H from "../../../lib/haptics";

export const SubjectTopicRow = React.memo(function SubjectTopicRow({
  topic,
  C,
  subjectColor,
  onPress,
  onToggle,
}) {
  const isDone = Boolean(topic.done);
  const pct = Math.min(100, Math.max(0, isDone ? 100 : (topic.pct || 0)));

  const handlePress = useCallback(() => {
    H.select();
    onPress?.(topic);
  }, [onPress, topic]);

  const handleToggle = useCallback(() => {
    H.tap();
    onToggle?.(topic);
  }, [onToggle, topic]);

  const statusColor =
    isDone ? C.up :
    topic.statusLabel?.startsWith("defter") ? C.warn :
    topic.statusLabel === "bugün" ? C.up :
    topic.statusLabel === "planda" ? C.text3 : C.text2;

  const metaText = topic.totalQuestions && topic.totalMinutes
    ? `${topic.totalQuestions} soru · ${formatMinutes(topic.totalMinutes)}`
    : topic.statusLabel === "planda" ? "planda" : `${topic.totalQuestions || 0} soru`;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleToggle}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isDone }}
        accessibilityLabel={`${topic.name} konusunu tamamlandı olarak işaretle`}
        style={styles.checkTouch}
      >
        <View
          style={[
            styles.box,
            {
              backgroundColor: isDone ? (subjectColor || C.accent) : "transparent",
              borderColor: isDone ? (subjectColor || C.accent) : C.line,
            },
          ]}
        >
          {isDone ? <Icon name="check" size={12} color={C.accentInk} sw={2.5} /> : null}
        </View>
      </Pressable>

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.contentPressable, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={`${topic.name} konusuna git`}
      >
        <View style={styles.body}>
          <Text
            style={[TYPOGRAPHY.bodyMedium, { color: isDone ? C.text2 : C.text }]}
            numberOfLines={1}
          >
            {topic.name}
          </Text>
          <View style={styles.subRow}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{metaText}</Text>
            <View style={styles.miniBarWrap}>
              <View style={[styles.miniTrack, { backgroundColor: C.track }]}>
                <View
                  style={[
                    styles.miniFill,
                    {
                      backgroundColor: isDone ? C.up : (pct > 0 ? (subjectColor || C.accent) : "transparent"),
                      width: `${pct}%`,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  TYPOGRAPHY.micro,
                  { color: isDone ? C.up : C.text3, fontVariant: ["tabular-nums"] },
                ]}
              >
                %{pct}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusWrap}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: statusColor }]}>
            {topic.statusLabel}
          </Text>
          <Icon name="chevR" size={12} color={C.text3} />
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2,
  },
  checkTouch: {
    paddingRight: STEP.s2 + 2,
    paddingVertical: STEP.s1,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  contentPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginTop: 2,
  },
  miniBarWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniTrack: {
    width: 38,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniFill: {
    height: 4,
    borderRadius: 2,
  },
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
