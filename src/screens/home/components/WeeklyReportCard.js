import { View, Text, Pressable } from "react-native";
import { Icon, Chip } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";

function StatBlock({ value, label, color, C }) {
  const isZero = value === 0 || value === "0dk";
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{
        fontFamily: isZero ? "Inter_500Medium" : "SpaceGrotesk_700Bold",
        fontSize: isZero ? 15 : 22,
        color: isZero ? C.muted : color,
      }}>
        {isZero ? "—" : value}
      </Text>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color: isZero ? C.muted : color, opacity: isZero ? 1 : 0.7, marginTop: 2 }}>
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
      <View style={{
        padding: 18, borderRadius: 24,
        backgroundColor: C.surface,
        borderWidth: 1, borderColor: C.border,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{
              width: 30, height: 30, borderRadius: 10,
              backgroundColor: C.accent + "14",
              alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="calendar" size={15} color={C.accent} />
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
          <StatBlock C={C} value={report.totalQuestions} label="Soru" color={C.orange} />
          <StatBlock C={C} value={hoursStr} label="Süre" color={C.purple} />
          <StatBlock C={C} value={report.activeDays} label="Aktif Gün" color={C.teal} />
          <StatBlock C={C} value={report.trialCount} label="Deneme" color={C.blue} />
        </View>

        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12 }}>
          {allZero ? "İlk çalışmanı yap, haftalık raporun başlasın" : "Detaylı raporu görmek için dokun"}
        </Text>
      </View>
    </Pressable>
  );
}
