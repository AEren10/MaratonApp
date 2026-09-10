import { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button, Icon } from "../../../components/design";
import { routeCreationSummary } from "../../../domain/route/routeCreation";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

function StatPill({ label, value, C }) {
  return (
    <View style={[styles.pill, { backgroundColor: C.surface2, borderColor: C.border }]}>
      <Text style={[styles.pillLabel, { color: C.muted }]}>{label}</Text>
      <Text style={[styles.pillValue, { color: C.text }]}>{value}</Text>
    </View>
  );
}

function RouteCreationCard({
  C,
  daysLeft,
  disabled,
  error,
  intelligence,
  loading,
  onCreate,
  routeCreated,
  weeks,
}) {
  const summary = useMemo(() => routeCreationSummary({
    weeks,
    intelligence,
    daysLeft,
    routeCreated,
  }), [daysLeft, intelligence, routeCreated, weeks]);

  return (
    <View
      accessible
      accessibilityLabel={`${summary.title}. Güven ${summary.confidenceLabel}. ${summary.riskLabel}.`}
      style={[styles.card, { backgroundColor: C.surface, borderColor: C.accent + "35" }]}
    >
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: C.accent + "18" }]}>
          <Icon name={routeCreated ? "checkCircle" : "zap"} size={22} color={C.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: C.accent }]}>ROTA OLUŞTUR</Text>
          <Text style={[styles.title, { color: C.text }]}>{summary.title}</Text>
          <Text style={[styles.body, { color: C.sec }]}>{summary.body}</Text>
        </View>
      </View>

      <View style={styles.pills}>
        <StatPill label="Güven" value={`%${summary.confidenceScore} · ${summary.confidenceLabel}`} C={C} />
        <StatPill label="İlk hafta" value={`${summary.firstWeekStops} durak`} C={C} />
        <StatPill label="Süre" value={summary.daysLeftLabel} C={C} />
      </View>

      <View style={[styles.reason, { backgroundColor: C.elev, borderColor: C.border }]}>
        <Icon name="lightbulb" size={16} color={C.orange} />
        <Text style={[styles.reasonText, { color: C.sec }]}>{summary.nextBestAction}</Text>
      </View>

      {error ? <Text style={[styles.error, { color: C.red }]}>{error}</Text> : null}
      <Button
        fullWidth
        icon={routeCreated ? "refresh" : "flag"}
        loading={loading}
        disabled={disabled || !summary.hasPreview}
        onPress={onCreate}
      >
        {loading ? "Analiz ediliyor..." : summary.actionLabel}
      </Button>
    </View>
  );
}

export default memo(RouteCreationCard);

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.xxl, borderWidth: 1, padding: SPACING.lg, marginBottom: SPACING.lg },
  top: { flexDirection: "row", gap: SPACING.md, alignItems: "flex-start" },
  icon: { width: 48, height: 48, borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro },
  title: { ...TYPOGRAPHY.subheading, marginTop: SPACING.xs },
  body: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  pills: { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.lg },
  pill: { flex: 1, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.sm },
  pillLabel: { ...TYPOGRAPHY.micro },
  pillValue: { ...TYPOGRAPHY.captionMedium, marginTop: 2 },
  reason: {
    borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, marginVertical: SPACING.lg,
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
  },
  reasonText: { ...TYPOGRAPHY.caption, flex: 1 },
  error: { ...TYPOGRAPHY.captionMedium, marginBottom: SPACING.md },
});
