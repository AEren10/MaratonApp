import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { buildRouteDebtSummary } from "../../../domain/route/routeDebtSummary";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

function Stat({ item, s }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{item.label}</Text>
      <Text style={s.statValue}>{item.value}</Text>
    </View>
  );
}

function RouteDebtCard({ C, debt, debtPlan, debtWeeks }) {
  const summary = buildRouteDebtSummary({ debt, debtPlan, debtWeeks });
  if (!summary) return null;
  const s = makeStyles(C, summary);

  return (
    <View style={s.card}>
      <View style={s.header}>
        <View style={s.iconBox}>
          <Icon name={summary.uncovered > 0 ? "alertCircle" : "repeat"} size={17} color={C.warn} />
        </View>
        <View style={s.copy}>
          <Text style={s.eyebrow}>BORÇ PLANI</Text>
          <Text style={s.title}>{summary.title}</Text>
          <Text style={s.body}>{summary.body}</Text>
        </View>
      </View>
      <View style={s.stats}>
        {summary.stats.map((item) => <Stat item={item} key={item.label} s={s} />)}
      </View>
    </View>
  );
}

export default memo(RouteDebtCard);

const makeStyles = (C, summary) => StyleSheet.create({
  card: {
    backgroundColor: summary.uncovered > 0 ? C.warn + "12" : C.surface,
    borderColor: summary.uncovered > 0 ? C.warn + "45" : C.border,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  header: { alignItems: "flex-start", flexDirection: "row", gap: SPACING.md },
  iconBox: {
    alignItems: "center",
    backgroundColor: C.warn + "18",
    borderRadius: RADIUS.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  copy: { flex: 1 },
  eyebrow: { ...TYPOGRAPHY.micro, color: C.warn },
  title: { ...TYPOGRAPHY.bodySemiBold, color: C.text, marginTop: SPACING.xs },
  body: { ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs },
  stats: { flexDirection: "row", gap: SPACING.sm },
  stat: {
    backgroundColor: C.elev,
    borderColor: C.line,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flex: 1,
    padding: SPACING.sm,
  },
  statLabel: { ...TYPOGRAPHY.micro, color: C.muted },
  statValue: { ...TYPOGRAPHY.captionMedium, color: C.text, marginTop: SPACING.xs },
});
