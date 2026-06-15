import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function StatsGrid({ stats }) {
  const C = useC();
  const tintColors = [C.amber, C.blue, C.green, C.purple];

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
        const color = tintColors[i % tintColors.length];
        return (
          <View
            key={i}
            style={{
              flex: 1,
              minWidth: "45%",
              padding: SPACING.lg,
              alignItems: "center",
              borderRadius: RADIUS.xl,
              backgroundColor: color + "14",
              borderWidth: 1,
              borderColor: color + "30",
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
              {stat.v}
            </Text>
            <Text style={[TYPOGRAPHY.micro, { color: C.sec }]}>
              {stat.l}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
