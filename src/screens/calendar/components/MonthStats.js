import { useMemo } from "react";
import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function StatBlock({ icon, color, label, value, styles }) {
  return (
    <View style={styles.block}>
      <View style={[styles.iconBox, { backgroundColor: color + "22" }]}>
        <Icon name={icon} size={16} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const makeStyles = (C) => ({
  row: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  block: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
  },
  value: {
    ...TYPOGRAPHY.bodySemiBold,
    color: C.text,
  },
  label: {
    ...TYPOGRAPHY.micro,
    color: C.muted,
    marginTop: 2,
  },
});

export function MonthStats({ stats }) {
  const C = useC();
  const styles = useMemo(() => makeStyles(C), [C]);
  const hoursStr = stats.totalMinutes >= 60
    ? `${(stats.totalMinutes / 60).toFixed(1)}sa`
    : `${stats.totalMinutes}dk`;

  return (
    <View style={styles.row}>
      <StatBlock icon="calendar" color={C.teal} label="Aktif Gün" value={stats.activeDays} styles={styles} />
      <StatBlock icon="clock" color={C.purple} label="Süre" value={hoursStr} styles={styles} />
      <StatBlock icon="target" color={C.orange} label="Soru" value={stats.totalQuestions} styles={styles} />
      <StatBlock icon="chart" color={C.blue} label="Deneme" value={stats.totalTrials} styles={styles} />
    </View>
  );
}

