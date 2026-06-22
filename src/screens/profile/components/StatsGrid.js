import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const DORMANT_HINTS = {
  "toplam soru": "İlk sorunu çöz",
  "saat çalışma": "Kronometreyi başlat",
  "deneme": "İlk denemeni gir",
  "gün en uzun seri": "Bugünden başla",
};

export function StatsGrid({ stats }) {
  const C = useC();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
      }}
    >
      {stats.map((stat, i) => {
        const isZero = stat.v === 0 || stat.v === "0" || stat.v === "0.0";
        const hint = isZero ? (DORMANT_HINTS[stat.l] || null) : null;
        return (
          <View
            key={i}
            accessible
            accessibilityLabel={hint || `${stat.v} ${stat.l}`}
            style={{
              flex: 1,
              minWidth: "45%",
              padding: SPACING.lg,
              alignItems: "center",
              borderRadius: RADIUS.xl,
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            {hint ? (
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: C.sec,
                  marginBottom: SPACING.xs,
                  textAlign: "center",
                }}
              >
                {hint}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 24,
                  lineHeight: 30,
                  letterSpacing: -0.5,
                  color: stat.color || C.text,
                  marginBottom: SPACING.xs,
                }}
              >
                {stat.v}
              </Text>
            )}
            <Text style={[TYPOGRAPHY.micro, { color: stat.color || C.sec, opacity: stat.color && !isZero ? 0.7 : 1 }]}>
              {stat.l}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
