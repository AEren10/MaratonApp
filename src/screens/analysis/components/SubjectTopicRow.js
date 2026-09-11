import React, { useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export const SubjectTopicRow = React.memo(function SubjectTopicRow({ topic, C, onPress }) {
  const handlePress = useCallback(() => { H.select(); onPress(topic); }, [onPress, topic]);
  const accLabel = topic.accuracy !== null ? `%${topic.accuracy}` : "—";

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.row, { borderColor: C.line, opacity: pressed ? 0.7 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`${topic.name} konusuna git`}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: topic.done ? C.accent : "transparent",
            borderColor: topic.done ? C.accent : C.border,
          },
        ]}
      >
        {topic.done ? <Icon name="check" size={11} color={C.accentInk} sw={2.4} /> : null}
      </View>

      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: topic.done ? C.text2 : C.text }]} numberOfLines={1}>
          {topic.name}
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: STEP.s1 / 2 }]}>{topic.meta}</Text>
      </View>

      <Text style={[TYPOGRAPHY.metaSemiBold, { color: topic.accuracy !== null ? C.text3 : C.text5 }]}>
        {accLabel}
      </Text>
      <Icon name="arrowR" size={11} color={C.text5} sw={1.7} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 - 1,
    borderTopWidth: 1,
    minHeight: 44,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.6,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  body: { flex: 1, minWidth: 0 },
});
