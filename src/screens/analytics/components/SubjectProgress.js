import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const STATUS_CFG = (C) => ({
  up: { bg: C.up + "15", color: C.up, icon: "trendUp", prefix: "+" },
  down: { bg: C.down + "15", color: C.down, icon: "trendDown", prefix: "" },
  stable: { bg: C.surface, color: C.text3, icon: null, prefix: "±" },
});

const DiffBadge = memo(function DiffBadge({ diff, status, C }) {
  const cfg = STATUS_CFG(C)[status] || STATUS_CFG(C).stable;
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[TYPOGRAPHY.micro, s.badgeText, { color: cfg.color }]}>
        {cfg.prefix}{status === "stable" ? Math.abs(diff).toFixed(1).replace(".", ",") : diff.toFixed(1).replace(".", ",")}
      </Text>
      {cfg.icon && <Icon name={cfg.icon} size={10} color={cfg.color} />}
    </View>
  );
});

const SubjectRow = memo(function SubjectRow({ item, isLast, C }) {
  return (
    <View style={[s.row, { borderBottomColor: C.line, borderBottomWidth: isLast ? 0 : 1 }]}>
      <Text style={[TYPOGRAPHY.tableName, s.subjectName, { color: C.text }]} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={s.compareNums}>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{item.previousAvg.toFixed(1).replace(".", ",")}</Text>
        <Icon name="arrowR" size={11} color={C.text4} />
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text }]}>{item.currentAvg.toFixed(1).replace(".", ",")}</Text>
      </View>
      <DiffBadge diff={item.diff} status={item.status} C={C} />
    </View>
  );
});

export function SubjectProgress({ subjects = [] }) {
  const C = useC();

  if (!subjects?.length) return null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.text2, marginBottom: STEP.s2 }]}>
        DERS BAZLI GELİŞİM
      </Text>
      <View style={s.list}>
        {subjects.map((item, i) => (
          <SubjectRow key={item.key} item={item} isLast={i === subjects.length - 1} C={C} />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginTop: STEP.s4,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: STEP.s2 + 2,
    gap: STEP.s2,
  },
  subjectName: {
    flex: 1,
  },
  compareNums: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    paddingHorizontal: STEP.s1,
    paddingVertical: 3,
    gap: 3,
  },
  badgeText: {
    fontVariant: ["tabular-nums"],
  },
});
