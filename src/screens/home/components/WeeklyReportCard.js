import { View, Text, Pressable } from "react-native";
import { Icon, Chip, IconBox, GlassCard } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function StatBlock({ value, label, color, C }) {
  const isZero = value === 0 || value === "0dk";
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{
        ...(isZero ? TYPOGRAPHY.bodyMedium : TYPOGRAPHY.statMedium),
        color: isZero ? C.muted : color,
      }}>
        {isZero ? "—" : value}
      </Text>
      <Text style={{
        ...TYPOGRAPHY.label, color: isZero ? C.muted : color,
        opacity: isZero ? 1 : 0.7, marginTop: 2,
      }}>
        {label}
      </Text>
    </View>
  );
}

export function WeeklyReportCard({ report, onPress }) {
  const C = useC();
  const hoursStr = report.totalMinutes >= 60
    ? `${(report.totalMinutes / 60).toFixed(1)}sa`
    : `${report.totalMinutes}dk`;
  const allZero = report.totalQuestions === 0 && report.activeDays === 0 && report.trialCount === 0;

  const deltaPositive = parseFloat(report.netDelta) > 0;
  const deltaColor = deltaPositive ? C.green : parseFloat(report.netDelta) < 0 ? C.red : C.muted;

  return (
    <Pressable onPress={onPress}>
      <GlassCard radius={RADIUS.xxl} style={{ padding: SPACING.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.lg }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: SPACING.sm }}>
            <IconBox icon="calendar" color={C.accent} size={30} rounded={10} />
            <Text style={{ ...TYPOGRAPHY.bodySemiBold, color: C.text }}>Bu Hafta</Text>
          </View>
          {report.hasPrev && (
            <Chip color={deltaColor}>
              <Icon name={deltaPositive ? "trendUp" : "trendDown"} size={11} color={deltaColor} />
              <Text style={{ ...TYPOGRAPHY.label, color: deltaColor }}>
                {deltaPositive ? "+" : ""}{report.netDelta} net
              </Text>
            </Chip>
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <StatBlock C={C} value={report.totalQuestions} label="Soru" color={C.orange} />
          <StatBlock C={C} value={hoursStr} label="Süre" color={C.purple} />
          <StatBlock C={C} value={report.activeDays} label="Aktif Gün" color={C.teal} />
          <StatBlock C={C} value={report.trialCount} label="Deneme" color={C.blue} />
        </View>

        <Text style={{ ...TYPOGRAPHY.micro, color: C.muted, textAlign: "center", marginTop: SPACING.md }}>
          {allZero ? "İlk çalışmanı yap, haftalık raporun başlasın" : "Detaylı raporu görmek için dokun"}
        </Text>
      </GlassCard>
    </Pressable>
  );
}
