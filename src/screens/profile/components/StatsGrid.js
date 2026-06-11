import { View, Text } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

const TINTS = [C.amber + "0C", C.blue + "0C", C.green + "0C", C.purple + "0C"];

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
        <View
          key={i}
          style={{
            flex: 1,
            minWidth: "45%",
            backgroundColor: TINTS[i] ?? C.surface,
            borderRadius: RADIUS.xl,
            borderWidth: 1,
            borderColor: C.border,
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
        </View>
      ))}
    </View>
  );
}
