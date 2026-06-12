import { View, Text } from "react-native";
import { Icon } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function StatBlock({ icon, color, label, value }) {
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

export function MonthStats({ stats }) {
  const hoursStr = stats.totalMinutes >= 60
    ? `${(stats.totalMinutes / 60).toFixed(1)}sa`
    : `${stats.totalMinutes}dk`;

  return (
    <View style={styles.row}>
      <StatBlock icon="calendar" color={C.amber} label="Aktif Gün" value={stats.activeDays} />
      <StatBlock icon="clock" color={C.blue} label="Süre" value={hoursStr} />
      <StatBlock icon="target" color={C.green} label="Soru" value={stats.totalQuestions} />
      <StatBlock icon="chart" color={C.teal} label="Deneme" value={stats.totalTrials} />
    </View>
  );
}

const styles = {
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
};
