import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { dailyPlanRiskCopy } from "../../../domain/plan/dailyPlanRiskCopy";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const SOURCE_LABELS = Object.freeze({
  route: "Rota",
  mixed: "Rota + adaptif",
  adaptive: "Adaptif",
  empty: "Veri bekliyor",
});

function Pill({ label, value, s }) {
  return (
    <View style={s.pill}>
      <Text style={s.pillLabel}>{label}</Text>
      <Text style={s.pillValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function PlanSummaryCard({ C, summary }) {
  if (!summary) return null;
  const s = makeStyles(C);
  const source = SOURCE_LABELS[summary.source] || SOURCE_LABELS.empty;
  const routeCount = summary.routeTaskCount > 0 ? `${summary.routeTaskCount} rota` : "rota yok";
  const risk = dailyPlanRiskCopy(summary.risks);

  return (
    <View style={s.card}>
      <View style={s.top}>
        <View style={s.iconBox}>
          <Icon name={summary.source === "adaptive" ? "lightbulb" : "target"} size={18} color={C.accent} />
        </View>
        <View style={s.copy}>
          <Text style={s.eyebrow}>PROGRAM KARARI</Text>
          <Text style={s.title}>{summary.title}</Text>
          <Text style={s.body}>{summary.body}</Text>
        </View>
      </View>

      <View style={s.pills}>
        <Pill label="Kaynak" value={source} s={s} />
        <Pill label="Güven" value={summary.confidenceLabel} s={s} />
        <Pill label="Yük" value={summary.effort} s={s} />
        <Pill label="Bağ" value={routeCount} s={s} />
      </View>

      <View style={s.nextBox}>
        <Icon name="target" size={15} color={C.accent} />
        <Text style={s.nextText}>{summary.nextAction}</Text>
      </View>

      {risk ? (
        <View style={s.riskBox}>
          <Icon name="info" size={15} color={C.warn} />
          <View style={s.riskCopy}>
            <Text style={s.riskTitle}>{risk.title}</Text>
            <Text style={s.riskBody}>{risk.body}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default memo(PlanSummaryCard);

const makeStyles = (C) => StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderColor: C.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  top: { alignItems: "flex-start", flexDirection: "row", gap: SPACING.md },
  iconBox: {
    alignItems: "center",
    backgroundColor: C.accent + "14",
    borderRadius: RADIUS.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro, color: C.accent },
  title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: SPACING.xs },
  body: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm },
  pill: {
    backgroundColor: C.elev,
    borderColor: C.line,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: "46%",
    padding: SPACING.sm,
  },
  pillLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  pillValue: { ...TYPOGRAPHY.captionMedium, color: C.text, marginTop: SPACING.xs },
  nextBox: {
    alignItems: "flex-start",
    backgroundColor: C.accent + "10",
    borderRadius: RADIUS.lg,
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  nextText: { ...TYPOGRAPHY.captionMedium, color: C.text, flex: 1 },
  riskBox: {
    alignItems: "flex-start",
    backgroundColor: C.warn + "10",
    borderColor: C.warn + "35",
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  riskCopy: { flex: 1 },
  riskTitle: { ...TYPOGRAPHY.captionMedium, color: C.text },
  riskBody: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
});
