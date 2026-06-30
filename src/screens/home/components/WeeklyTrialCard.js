import { View, Text, Pressable } from "react-native";
import { Icon, Chip, IconBox, GlassCard } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function StatBlock({ value, label, color, C }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ ...TYPOGRAPHY.statMedium, color }}>{value}</Text>
      <Text style={{ ...TYPOGRAPHY.label, color, opacity: 0.7, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export function WeeklyTrialCard({ report, onPress }) {
  const C = useC();
  if (report.count === 0) return null;

  const delta = parseFloat(report.netDelta);
  const deltaColor = delta > 0 ? C.green : delta < 0 ? C.red : C.muted;

  return (
    <Pressable onPress={onPress}>
      <GlassCard radius={RADIUS.xxl} style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <IconBox icon="target" color={C.accent} size={30} rounded={10} />
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Haftalık Deneme</Text>
          </View>
          {report.hasPrev && delta !== 0 && (
            <Chip color={deltaColor}>
              <Icon name={delta > 0 ? "trendUp" : "trendDown"} size={11} color={deltaColor} />
              <Text style={{ ...TYPOGRAPHY.label, color: deltaColor }}>
                {delta > 0 ? "+" : ""}{report.netDelta} net
              </Text>
            </Chip>
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <StatBlock C={C} value={String(report.count)} label="Deneme" color={C.blue} />
          <StatBlock C={C} value={report.avgNet} label="Ort. Net" color={C.purple} />
          <StatBlock C={C} value={report.bestNet} label="En İyi" color={C.green} />
          <StatBlock C={C} value={String(report.totalCorrect)} label="Doğru" color={C.orange} />
        </View>

        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, textAlign: "center", marginTop: SPACING.md }}>
          Detaylı raporu görmek için dokun
        </Text>
      </GlassCard>
    </Pressable>
  );
}
