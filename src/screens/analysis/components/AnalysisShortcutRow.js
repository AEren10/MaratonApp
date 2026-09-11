import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { AnimatedCard } from "../../../components/design/AnimatedCard";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";

export function AnalysisShortcutRow({ C, go, screens }) {
  return (
    <AnimatedCard delay={60}>
      <View style={{ flexDirection: "row", gap: STEP.s1 }}>
        <Shortcut
          C={C}
          color={C.accent}
          icon="trendUp"
          label="Senaryolar"
          onPress={() => go(screens.NET_FORECAST, undefined, "analysis_net_forecast")}
        />
        <Shortcut
          C={C}
          color={C.text}
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
        minHeight: CONTROL.tapMin,
        alignItems: "center",
        gap: STEP.s1,
        padding: STEP.s3,
        borderRadius: SHAPE.sheet,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        opacity: pressed ? 0.85 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ width: 36, height: 36, borderRadius: SHAPE.iconBox, backgroundColor: color + "18", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text, textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}
