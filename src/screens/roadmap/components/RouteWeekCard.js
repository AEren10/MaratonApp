import { memo, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import {
  getEffectiveRouteStopStatus,
  ROUTE_STOP_STATUS,
  routeStopStatusLabel,
} from "../../../domain/route/stopStatus";
import { RADIUS, SPACING, TYPOGRAPHY } from "../../../themes/tokens";

const ICON_BY_STATUS = {
  [ROUTE_STOP_STATUS.COMPLETED]: "check",
  [ROUTE_STOP_STATUS.RESCHEDULED]: "repeat",
  [ROUTE_STOP_STATUS.SKIPPED]: "x",
  [ROUTE_STOP_STATUS.LOCKED]: "lock",
  [ROUTE_STOP_STATUS.FROZEN]: "pause",
};

function StopNode({ stop, frozen, C, isLast }) {
  const status = getEffectiveRouteStopStatus(stop.lifecycleStatus, { frozen });
  const label = routeStopStatusLabel(status);
  const active = status === ROUTE_STOP_STATUS.ACTIVE;
  const upcoming = status === ROUTE_STOP_STATUS.UPCOMING;
  const completed = status === ROUTE_STOP_STATUS.COMPLETED;
  const dashed = [ROUTE_STOP_STATUS.UPCOMING, ROUTE_STOP_STATUS.RESCHEDULED, ROUTE_STOP_STATUS.FROZEN].includes(status);
  const color = completed ? (stop.color || C.up) : active ? C.accent : C.muted;
  const icon = ICON_BY_STATUS[status];
  const insight = stop.insight;

  return (
    <View style={styles.stopRow} accessible accessibilityLabel={`${stop.subjectLabel || stop.subject}, ${stop.topic}, ${label}`}>
      <View style={styles.rail}>
        <View style={styles.hitArea}>
          <View style={[
            styles.node,
            { borderColor: color, backgroundColor: completed ? color : C.bg },
            dashed && styles.dashedNode,
          ]}>
            {icon ? <Icon name={icon} size={14} color={completed ? C.textOnFill : color} /> : null}
            {active ? <View style={[styles.activeCore, { backgroundColor: C.accent }]} /> : null}
            {upcoming ? <View style={[styles.upcomingCore, { backgroundColor: C.bg }]} /> : null}
          </View>
        </View>
        {!isLast ? <View style={[styles.line, dashed ? styles.dashedLine : null, { borderColor: C.border, backgroundColor: dashed ? "transparent" : color }]} /> : null}
      </View>
      <View style={[styles.stopCard, { borderColor: C.line }]}>
        <Text style={[styles.topic, { color: C.text }]} numberOfLines={2}>{stop.topic}</Text>
        <Text style={[styles.meta, { color: C.sec }]}>
          {stop.subjectLabel || stop.subject} · {stop.cost?.questions ?? stop.plannedQuestions ?? 0} soru
        </Text>
        <Text style={[styles.status, { color }]}>{label}</Text>
        {insight?.reasonText ? (
          <View style={[styles.insight, { backgroundColor: C.accent + "12" }]}>
            <Icon name="info" size={12} color={C.accent} />
            <Text style={[styles.insightText, { color: C.sec }]} numberOfLines={2}>
              {insight.reasonText}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RouteWeekCard({ week, frozen, C }) {
  const [expanded, setExpanded] = useState(week.isCurrent);
  const stops = week.stops || [];
  const title = week.isCurrent ? "Bu Hafta" : `${week.weekNo}. Hafta`;
  const dateLabel = week.weekStart && week.weekEnd ? `${week.weekStart} — ${week.weekEnd}` : "";
  const renderedStops = useMemo(() => stops.map((stop, index) => (
    <StopNode key={stop.logicalStopKey || `${stop.subject}-${stop.topic}-${index}`} stop={stop} frozen={frozen} C={C} isLast={index === stops.length - 1} />
  )), [C, frozen, stops]);

  return (
    <View style={[styles.week, { borderColor: week.isCurrent ? C.accent : C.border, backgroundColor: C.surface }]}>
      <Pressable
        accessibilityLabel={`${title}, ${stops.length} durak`}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.weekHeader}
      >
        <View style={styles.weekCopy}>
          <Text style={[styles.weekTitle, { color: week.isCurrent ? C.accent : C.text }]}>{title}</Text>
          <Text style={[styles.weekMeta, { color: C.muted }]}>{stops.length} durak{dateLabel ? ` · ${dateLabel}` : ""}</Text>
        </View>
        <Icon name={expanded ? "chevDown" : "chevR"} size={20} color={C.muted} />
      </Pressable>
      {expanded ? <View style={styles.stopList}>{renderedStops}</View> : null}
    </View>
  );
}

export default memo(RouteWeekCard);

const styles = StyleSheet.create({
  week: { borderWidth: 1, borderRadius: RADIUS.xxl, marginBottom: SPACING.lg, overflow: "hidden" },
  weekHeader: { minHeight: 56, padding: SPACING.lg, flexDirection: "row", alignItems: "center" },
  weekCopy: { flex: 1 },
  weekTitle: { ...TYPOGRAPHY.bodySemiBold },
  weekMeta: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  stopList: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  stopRow: { flexDirection: "row", minHeight: 72 },
  rail: { width: 48, alignItems: "center" },
  hitArea: { width: 48, height: 48, alignItems: "center", justifyContent: "center", zIndex: 1 },
  node: { width: 28, height: 28, borderRadius: RADIUS.pill, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  dashedNode: { borderStyle: "dashed" },
  activeCore: { width: 10, height: 10, borderRadius: RADIUS.pill },
  upcomingCore: { width: 6, height: 6, borderRadius: RADIUS.pill },
  line: { position: "absolute", top: 36, bottom: 0, width: 2 },
  dashedLine: { width: 0, borderLeftWidth: 2, borderStyle: "dashed" },
  stopCard: { flex: 1, borderBottomWidth: 1, paddingVertical: SPACING.sm, paddingRight: SPACING.sm },
  topic: { ...TYPOGRAPHY.bodySemiBold },
  meta: { ...TYPOGRAPHY.caption, marginTop: SPACING.xs },
  status: { ...TYPOGRAPHY.micro, marginTop: SPACING.xs, textTransform: "uppercase" },
  insight: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    flexDirection: "row",
    gap: SPACING.xs,
    alignItems: "center",
  },
  insightText: { ...TYPOGRAPHY.micro, flex: 1 },
});
