import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function AnalysisShortcutRow({ C, go, screens }) {
  return (
    <AnimatedCard delay={60}>
      <View style={{ flexDirection: "row", gap: SPACING.sm }}>
        <Shortcut
          C={C}
          color={C.accent}
          icon="trendUp"
          label="Senaryolar"
          onPress={() => go(screens.NET_FORECAST, undefined, "analysis_net_forecast")}
        />
        <Shortcut
          C={C}
          color={C.blue}
          icon="chart"
          label="Dönem Analizi"
          onPress={() => go(screens.COMPARATIVE, undefined, "analysis_comparative")}
        />
      </View>
    </AnimatedCard>
  );
}

function Shortcut({ C, color, icon, label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: "center",
        gap: SPACING.sm,
        padding: SPACING.lg,
        borderRadius: RADIUS.xxl,
        backgroundColor: color + "12",
        borderWidth: 1,
        borderColor: color + "25",
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: color + "20", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text, textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}
