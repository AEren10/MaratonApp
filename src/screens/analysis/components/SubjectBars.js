import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { GlassCard, Icon } from "../../../components/design";

function Bar({ name, color, net, max, delay, onPress, C }) {
  const pct = max > 0 ? Math.min(net / max, 1) : 0;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(pct, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [pct, delay, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, opacity: pressed ? 0.7 : 1 }]}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text
        style={{ ...TYPOGRAPHY.captionMedium, color, width: 74 }}
        numberOfLines={1}
      >
        {name}
      </Text>

      <View style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: color + "1A", overflow: "hidden" }}>
        <Animated.View
          style={[
            {
              height: 12,
              borderRadius: 6,
              backgroundColor: color,
            },
            fillStyle,
          ]}
        />
      </View>

      <Text style={{ fontFamily: "SpaceGrotesk_700Bold", fontSize: 13, color: C.text, width: 60, textAlign: "right", letterSpacing: -0.3 }}>
        {Number(net).toFixed(1)}<Text style={{ ...TYPOGRAPHY.micro, color: C.muted }}>/{max}</Text>
      </Text>
      <Icon name="chevR" size={12} color={C.muted} />
    </Pressable>
  );
}

export function SubjectBars({ bars, onBarPress }) {
  const C = useC();
  return (
    <View style={{ gap: SPACING.md }}>
      <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Ders Bazlı</Text>
      <GlassCard
        radius={24}
        style={{
          padding: SPACING.lg,
          gap: SPACING.md,
        }}
      >
        {bars.map((b, i) => (
          <Bar
            key={b.key || `${b.name}-${i}`}
            name={b.name}
            color={b.color}
            net={b.net}
            max={b.max}
            delay={i * 120}
            onPress={() => onBarPress?.(b)}
            C={C}
          />
        ))}
      </GlassCard>
    </View>
  );
}
