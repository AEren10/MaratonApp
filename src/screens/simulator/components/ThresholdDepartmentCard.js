import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const ThresholdDepartmentCard = memo(function ThresholdDepartmentCard({ program }) {
  const C = useC();
  if (!program) return null;

  const isAhead = program.diff >= 0;
  const diffSign = isAhead ? `+${program.diff}` : `${program.diff}`;
  const diffColor = isAhead ? C.up : C.text3;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={styles.info}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {program.name}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 3 }]} numberOfLines={1}>
          {`${program.uni} · 2025 tabanı`}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={[TYPOGRAPHY.tableName, styles.netNum, { color: C.text }]}>
          {program.requiredNet} net
        </Text>
        <Text style={[TYPOGRAPHY.micro, styles.diff, { color: diffColor }]}>
          {`${diffSign} net`}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    paddingVertical: STEP.s2 + 2,
    paddingHorizontal: STEP.s3 - 4,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  info: { flex: 1, minWidth: 0 },
  stat: { alignItems: "flex-end", flexShrink: 0 },
  netNum: { fontVariant: ["tabular-nums"] },
  diff: { marginTop: 2, fontVariant: ["tabular-nums"] },
});
