import { View, Text, Pressable } from "react-native";
import { Icon, Chip } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { RADIUS, SPACING } from "../../../themes/tokens";

function StatBlock({ value, label, color, C }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 22, color }}>
        {value}
      </Text>
      <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 11, color, opacity: 0.7, marginTop: 2 }}>
        {label}
      </Text>
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
      <View style={{
        padding: 18, borderRadius: RADIUS.xxl,
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
              <Icon name="target" size={15} color={C.accent} />
            </View>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.text }}>
              Haftalık Deneme
            </Text>
          </View>
          {report.hasPrev && delta !== 0 && (
            <Chip color={deltaColor}>
              <Icon name={delta > 0 ? "trendUp" : "trendDown"} size={11} color={deltaColor} />
              <Text style={{ color: deltaColor, fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
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

        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12 }}>
          Detaylı raporu görmek için dokun
        </Text>
      </View>
    </Pressable>
  );
}
