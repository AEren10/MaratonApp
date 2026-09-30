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

  const netLabel = program.aytNet
    ? `TYT ~${program.tytNet} · AYT ~${program.aytNet}`
    : `TYT ~${program.tytNet} net`;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={styles.info}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {program.name}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]} numberOfLines={1}>
          {`${program.uni} · ${program.rank ? `${program.rank.toLocaleString("tr-TR")}. sıra` : "2025 tabanı"}`}
        </Text>
      </View>
      <View style={styles.stat}>
        <Text style={[TYPOGRAPHY.tableName, styles.netNum, { color: C.text }]}>
          {netLabel}
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
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  info: { flex: 1, minWidth: 0 },
  stat: { alignItems: "flex-end", flexShrink: 0 },
  netNum: { fontVariant: ["tabular-nums"] },
  diff: { marginTop: STEP.s1 / 4, fontVariant: ["tabular-nums"] },
});
