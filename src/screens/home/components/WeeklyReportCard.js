import { View, Text, Pressable } from "react-native";
import { Icon, Chip, GlassCard } from "../../../components/design";
import { C } from "../../../themes/tokens";

function StatBlock({ value, label, color }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 20, color }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export function WeeklyReportCard({ report, onPress }) {
  const hoursStr = report.totalMinutes >= 60
    ? `${(report.totalMinutes / 60).toFixed(1)}sa`
    : `${report.totalMinutes}dk`;

  const deltaPositive = parseFloat(report.netDelta) > 0;
  const deltaColor = deltaPositive ? C.green : parseFloat(report.netDelta) < 0 ? C.red : C.muted;

  return (
    <Pressable onPress={onPress}>
      <GlassCard radius={24} intensity={36} style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Icon name="calendar" size={16} color={C.blue} />
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text }}>
              Bu Hafta
            </Text>
          </View>
          {report.hasPrev && (
            <Chip color={deltaColor}>
              <Icon
                name={deltaPositive ? "trendUp" : "trendDown"}
                size={11}
                color={deltaColor}
              />
              <Text style={{ color: deltaColor, fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
                {deltaPositive ? "+" : ""}{report.netDelta} net
              </Text>
            </Chip>
          )}
        </View>

        <View style={{ flexDirection: "row" }}>
          <StatBlock value={report.totalQuestions} label="Soru" color={C.amber} />
          <StatBlock value={hoursStr} label="Süre" color={C.blue} />
          <StatBlock value={report.activeDays} label="Aktif Gün" color={C.green} />
          <StatBlock value={report.trialCount} label="Deneme" color={C.purple} />
        </View>
      </GlassCard>
    </Pressable>
  );
}
