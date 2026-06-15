import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { GlassCard } from "../../../components/design";

const TINT_COLORS = [C.amber, C.blue, C.green, C.purple];

export function StatsGrid({ stats }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: SPACING.md,
        marginBottom: SPACING.xxl,
      }}
    >
      {stats.map((s, i) => (
        <GlassCard
          key={i}
          radius={RADIUS.xl}
          color={TINT_COLORS[i]}
          style={{
            flex: 1,
            minWidth: "45%",
            padding: SPACING.lg,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 24,
              lineHeight: 30,
              letterSpacing: -0.5,
              color: C.text,
              marginBottom: SPACING.xs,
            }}
          >
            {s.v}
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.sec }]}>
            {s.l}
          </Text>
        </GlassCard>
      ))}
    </View>
  );
}
