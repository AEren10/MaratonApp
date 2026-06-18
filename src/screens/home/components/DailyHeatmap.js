import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function DailyHeatmap({ dailyHeatmap }) {
  const C = useC();
  if (!dailyHeatmap || dailyHeatmap.length === 0) return null;
  const maxQ = Math.max(...dailyHeatmap.map((d) => d.questions), 1);

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ ...TYPOGRAPHY.bodySemiBold, fontSize: 14, color: C.text, marginBottom: 16 }}>
        Günlük Aktivite
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
        {dailyHeatmap.map((d) => {
          const h = d.active ? Math.max(12, (d.questions / maxQ) * 48) : 6;
          const today = new Date().toISOString().split("T")[0] === d.date;
          return (
            <View key={d.date} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <View style={{
                width: "100%", height: 52, justifyContent: "flex-end", alignItems: "center",
              }}>
                <View style={{
                  width: "80%", height: h, borderRadius: 4,
                  backgroundColor: d.active ? C.green : C.surface2,
                  opacity: d.active ? (0.4 + (d.questions / maxQ) * 0.6) : 0.4,
                }} />
              </View>
              <Text style={{
                ...TYPOGRAPHY.micro, fontSize: 10,
                color: today ? C.amber : d.active ? C.text : C.muted,
                fontFamily: today ? "Inter_700Bold" : "Inter_500Medium",
              }}>
                {d.label}
              </Text>
              {d.active ? (
                <Text style={{ ...TYPOGRAPHY.micro, fontSize: 11, color: C.sec }}>{d.questions}</Text>
              ) : (
                <Text style={{ ...TYPOGRAPHY.micro, fontSize: 11, color: C.muted }}>—</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
