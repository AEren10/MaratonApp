import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PREFERENCE_STATUS_LABELS } from "../../../domain/preference/preferenceEngine";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export const PreferenceProgramRow = memo(function PreferenceProgramRow({ item, scoreType, tone, C }) {
  const p = item.program;
  const pType = (p.type || scoreType || "say").toUpperCase();
  const netLabel = scoreType === "tyt"
    ? `TYT ~${p.tytNet}`
    : `TYT ~${p.tytNet} · ${pType} ~${p.aytNet}`;

  const statusLabel = item.status === "blocked"
    ? (item.barrier?.limit ? `Baraj (${Math.round(item.barrier.limit / 1000)}k)` : "Baraj")
    : PREFERENCE_STATUS_LABELS[item.status] || "Uzak";

  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <View style={[styles.typeBadge, { backgroundColor: C.void, borderColor: C.line }]}>
            <Text style={[styles.typeBadgeText, { color: C.text2 }]}>{pType}</Text>
          </View>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.nameText, { color: C.text }]} numberOfLines={1}>
            {p.name}
          </Text>
        </View>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3, marginTop: 4 }]} numberOfLines={1}>
          {`${p.uni} · ${p.rank?.toLocaleString("tr-TR")}. sıra`}
        </Text>
      </View>
      <View style={styles.badgeCol}>
        <View style={[styles.pill, { backgroundColor: C[tone.color] + tone.bg, borderColor: C[tone.border] }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C[tone.color], fontFamily: "Archivo_600" }]}>
            {statusLabel}
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
  info: { flex: 1, minWidth: 0, paddingRight: STEP.s1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  typeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontFamily: "Archivo_600",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  nameText: { flex: 1 },
  badgeCol: { alignItems: "flex-end", gap: 4 },
  pill: {
    paddingHorizontal: STEP.s1,
    paddingVertical: 2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  tabNum: { fontVariant: ["tabular-nums"] },
});
