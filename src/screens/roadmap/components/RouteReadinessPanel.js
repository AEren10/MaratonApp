import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const STATUS_ICON = Object.freeze({
  ok: "checkCircle",
  warn: "alertCircle",
  block: "lock",
});
const STATUS_ORDER = Object.freeze({ block: 0, warn: 1, ok: 2 });

function statusColor(status, C) {
  if (status === "ok") return C.green;
  if (status === "block") return C.red;
  return C.amber;
}

function ReadinessRow({ check, C }) {
  const color = statusColor(check.status, C);
  return (
    <View style={styles.row}>
      <Icon name={STATUS_ICON[check.status] || "info"} size={16} color={color} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, { color: C.text }]}>{check.label}</Text>
        <Text style={[styles.rowDetail, { color: C.muted }]}>{check.detail}</Text>
      </View>
    </View>
  );
}

function RouteReadinessPanel({ C, readiness }) {
  const visibleChecks = useMemo(() => [...(readiness?.checks || [])]
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 3) - (STATUS_ORDER[b.status] ?? 3))
    .slice(0, 4), [readiness?.checks]);
  if (!readiness) return null;
  const borderColor = readiness.status === "ready" ? C.green + "55"
    : readiness.status === "blocked" ? C.red + "55" : C.amber + "55";

  return (
    <View style={[styles.panel, { backgroundColor: C.surface2, borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: C.muted }]}>KALİTE KONTROL</Text>
          <Text style={[styles.title, { color: C.text }]}>{readiness.title}</Text>
        </View>
        <View style={[styles.score, { borderColor }]}>
          <Text style={[styles.scoreValue, { color: C.text }]}>%{readiness.score}</Text>
        </View>
      </View>
      <Text style={[styles.summary, { color: C.sec }]}>{readiness.summary}</Text>
      <View style={styles.rows}>
        {visibleChecks.map((check) => (
          <ReadinessRow key={check.key} check={check} C={C} />
        ))}
      </View>
    </View>
  );
}

export default memo(RouteReadinessPanel);

const styles = StyleSheet.create({
  panel: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md },
  headerCopy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro },
  title: { ...TYPOGRAPHY.bodySemiBold, marginTop: SPACING.xs },
  score: {
    minWidth: 58,
    minHeight: 40,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: { ...TYPOGRAPHY.captionMedium },
  summary: { ...TYPOGRAPHY.caption, marginTop: SPACING.sm },
  rows: { gap: SPACING.sm, marginTop: SPACING.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm },
  rowCopy: { flex: 1 },
  rowLabel: { ...TYPOGRAPHY.captionMedium },
  rowDetail: { ...TYPOGRAPHY.micro, marginTop: 1 },
});
