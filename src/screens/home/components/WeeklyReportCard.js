import { View, Text, Pressable } from "react-native";
import { Icon, Chip } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

function StatBlock({ value, label, color, C }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, marginTop: 2 }}>
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

  const deltaPositive = parseFloat(report.netDelta) > 0;
  const deltaColor = deltaPositive ? C.green : parseFloat(report.netDelta) < 0 ? C.red : C.muted;

  return (
    <Pressable onPress={onPress}>
      <View style={{
        padding: 18, borderRadius: 24,
        backgroundColor: C.surface,
        borderWidth: 1, borderColor: C.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{
              width: 30, height: 30, borderRadius: 10,
              backgroundColor: C.blue + "1A",
              alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="calendar" size={15} color={C.blue} />
            </View>
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
          <StatBlock C={C} value={report.totalQuestions} label="Soru" color={C.amber} />
          <StatBlock C={C} value={hoursStr} label="Süre" color={C.blue} />
          <StatBlock C={C} value={report.activeDays} label="Aktif Gün" color={C.green} />
          <StatBlock C={C} value={report.trialCount} label="Deneme" color={C.purple} />
        </View>
      </View>
    </Pressable>
  );
}
