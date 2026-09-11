import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { Card } from "../../../components/design";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { selectStreak } from "../../../store/slices/studyLogSlice";

function StatCell({ value, label, C, last }) {
  return (
    <View style={[styles.cell, !last && { borderRightWidth: 1, borderRightColor: C.line }]}>
      <Text style={[TYPOGRAPHY.statMedium, { color: C.text, fontVariant: ["tabular-nums"] }]}>{value}</Text>
      <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

export const MonthStats = React.memo(function MonthStats({ stats }) {
  const C = useC();
  const streak = useSelector(selectStreak);

  return (
    <Card tone="surface" radius="panel" padded={false} style={styles.card}>
      <StatCell value={stats.totalQuestions} label="soru" C={C} />
      <StatCell value={stats.totalTrials} label="deneme" C={C} />
      <StatCell value={stats.activeDays} label="aktif gün" C={C} />
      <StatCell value={streak ?? 0} label="seri" C={C} last />
    </Card>
  );
});

const styles = {
  card: { flexDirection: "row", paddingVertical: STEP.s2 },
  cell: { flex: 1, alignItems: "center" },
};
