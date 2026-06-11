import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function StaticBar({ value, color }) {
  return (
    <View
      style={{
        width: `${value}%`,
        height: "100%",
        borderRadius: RADIUS.sm,
        backgroundColor: color,
      }}
    />
  );
}

export function StrengthBars({ strengths }) {
  const sorted = [...strengths].sort((a, b) => b.v - a.v);

  return (
    <View style={{ marginBottom: SPACING.xxl }}>
      <Text
        style={[
          TYPOGRAPHY.label,
          { color: C.sec, marginBottom: SPACING.md, paddingHorizontal: SPACING.xs },
        ]}
      >
        {"DERS BAŞARI ORANLARI"}
      </Text>
      <View style={{ gap: SPACING.md }}>
        {sorted.map((s, i) => (
          <View key={i} style={{ gap: SPACING.xs }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={[TYPOGRAPHY.captionMedium, { color: C.text }]}>
                {s.name}
              </Text>
              <Text
                style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 15,
                  color: s.c,
                }}
              >
                %{s.v}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                borderRadius: RADIUS.sm,
                backgroundColor: C.surface,
                overflow: "hidden",
              }}
            >
              <StaticBar value={s.v} color={s.c} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
