import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { formatMinutes } from "../../../lib/format";
import * as H from "../../../lib/haptics";

export const SubjectTopicRow = React.memo(function SubjectTopicRow({ topic, C, onPress }) {
  const handlePress = useCallback(() => { H.select(); onPress(topic); }, [onPress, topic]);
  
  const statusColor = 
    topic.statusLabel?.startsWith("defter") ? C.warn : 
    topic.statusLabel === "bugün" ? C.up : 
    topic.statusLabel === "planda" ? C.text3 : C.text2;

  const metaText = topic.totalQuestions && topic.totalMinutes 
    ? `${topic.totalQuestions} soru · ${formatMinutes(topic.totalMinutes)}`
    : topic.statusLabel === "planda" ? "planda" : `${topic.totalQuestions || 0} soru`;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${topic.name} konusuna git`}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: topic.done ? C.accent : "transparent",
            borderColor: topic.done ? C.accent : C.line,
          },
        ]}
      >
        {topic.done ? <Icon name="check" size={13} color={C.accentInk} sw={2.5} /> : null}
      </View>

      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: topic.done ? C.text2 : C.text }]} numberOfLines={1}>
          {topic.name}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 2 }]}>{metaText}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: statusColor }]}>
          {topic.statusLabel}
        </Text>
        <Icon name="chevR" size={12} color={C.text3} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s3,
    paddingVertical: STEP.s2,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    justifyContent: "center",
  },
});
