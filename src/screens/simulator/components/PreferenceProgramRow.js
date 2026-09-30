import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PREFERENCE_STATUS_LABELS } from "../../../domain/preference/preferenceEngine";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const PreferenceProgramRow = memo(function PreferenceProgramRow({ item, scoreType, tone, C }) {
  const p = item.program;
  const netLabel = scoreType === "tyt"
    ? `TYT ~${p.tytNet} net`
    : `TYT ~${p.tytNet} · ${scoreType.toUpperCase()} ~${p.aytNet}`;

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={styles.info}>
        <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: STEP.s1 / 4 }]} numberOfLines={1}>
          {`${p.uni} · ${p.rank?.toLocaleString("tr-TR")}. sıra`}
        </Text>
      </View>
      <View style={styles.badgeCol}>
        <View style={[styles.pill, { backgroundColor: C[tone.color] + tone.bg }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C[tone.color] }]}>
            {item.status === "blocked" ? "Baraj" : PREFERENCE_STATUS_LABELS[item.status]}
          </Text>
        </View>
        <Text style={[TYPOGRAPHY.micro, styles.tabNum, { color: C.text2 }]}>
          {netLabel}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  info: { flex: 1, minWidth: 0 },
  badgeCol: { alignItems: "flex-end", gap: STEP.s1 / 2 },
  pill: { paddingHorizontal: STEP.s1, paddingVertical: STEP.s1 / 4, borderRadius: SHAPE.chip },
  tabNum: { fontVariant: ["tabular-nums"] },
});
