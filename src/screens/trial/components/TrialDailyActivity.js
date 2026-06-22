import { View, Text } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function TrialDailyActivity({ dailyActivity }) {
  const C = useC();
  const maxCount = Math.max(...dailyActivity.map((d) => d.count), 1);

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: RADIUS.xl,
      padding: SPACING.lg, borderWidth: 1, borderColor: C.border,
    }}>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec, marginBottom: SPACING.md }}>
        Günlük Deneme
      </Text>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6, height: 80 }}>
        {dailyActivity.map((d) => {
          const h = d.count > 0 ? Math.max(12, (d.count / maxCount) * 64) : 6;
          const active = d.count > 0;
          return (
            <View key={d.label} style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold", fontSize: 11,
                color: active ? C.accent : "transparent",
              }}>
                {d.count}
              </Text>
              <View style={{
                width: "100%", height: h, borderRadius: 4,
                backgroundColor: active ? C.accent : C.surface2,
              }} />
              <Text style={{
                fontFamily: "Inter_500Medium", fontSize: 11,
                color: active ? C.text : C.muted,
              }}>
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
