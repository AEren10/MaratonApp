import { useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Card, Icon } from "../../../components/design";

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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}: ${Number(net).toFixed(1)} / ${max}`}
      style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: STEP.s1, opacity: pressed ? 0.7 : 1 }]}
    >
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

      <Text style={{ ...TYPOGRAPHY.statMedium, fontSize: 13, lineHeight: 16, color: C.text, width: 60, textAlign: "right" }}>
        {Number(net).toFixed(1)}<Text style={{ ...TYPOGRAPHY.micro, color: C.text3 }}>/{max}</Text>
      </Text>
      <Icon name="chevR" size={12} color={C.text3} />
    </Pressable>
  );
}

export function SubjectBars({ bars, onBarPress }) {
  const C = useC();
  return (
    <View style={{ gap: STEP.s2 }}>
      <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Ders Bazlı</Text>
      <Card
        tone="surface"
        radius="sheet"
        style={{
          padding: STEP.s3,
          gap: STEP.s2,
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
      </Card>
    </View>
  );
}
