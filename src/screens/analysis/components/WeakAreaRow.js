import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const STATUS_META = {
  critical: "Çok düşük başarı",
  low: "Düşük başarı",
};

export const WeakAreaRow = React.memo(function WeakAreaRow({ item, C, onPress }) {
  const color = item.subject.color;
  const badgeColor = item.status === "critical" ? C.warn : C.text3;

  return (
    <Pressable
      onPress={() => { H.select(); onPress(item); }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: C.surface, borderColor: C.elev, opacity: pressed ? 0.75 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} konusuna git`}
    >
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
            {item.name}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.track, { backgroundColor: C.track }]}>
            <View style={[styles.fill, { backgroundColor: color, width: `${item.acc}%` }]} />
          </View>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{STATUS_META[item.status]}</Text>
        </View>
      </View>
      <Text style={[TYPOGRAPHY.micro, { color: badgeColor }]}>{item.acc}%</Text>
      <Icon name="arrowR" size={12} color={C.text3} sw={2} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 1,
    padding: STEP.s2 + 3,
    borderRadius: SHAPE.card,
    borderWidth: 1,
    minHeight: 44,
  },
  body: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  dot: { width: 9, height: 9, borderRadius: 1, flexShrink: 0 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 1, marginTop: STEP.s1 + 1 },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: 4, borderRadius: 2 },
});
