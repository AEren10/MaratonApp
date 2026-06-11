import { useEffect, useRef } from "react";
import { View, Text, Animated, Pressable } from "react-native";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

function Bar({ name, color, net, max, delay, onPress }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? net / max : 0;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 800,
      delay,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: SPACING.sm, opacity: pressed ? 0.7 : 1 }]}>
      <Text
        style={{ ...TYPOGRAPHY.captionMedium, color: C.sec, width: 68 }}
        numberOfLines={1}
      >
        {name}
      </Text>

      <View style={{ flex: 1, height: 10, borderRadius: RADIUS.sm, backgroundColor: color + "1A" }}>
        <Animated.View
          style={{
            height: 10,
            borderRadius: RADIUS.sm,
            backgroundColor: color,
            width,
          }}
        />
      </View>

      <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.text, width: 56, textAlign: "right" }}>
        {net}/{max}
      </Text>
    </Pressable>
  );
}

export function SubjectBars({ bars, onBarPress }) {
  return (
    <View style={{ gap: SPACING.md }}>
      <Text style={{ ...TYPOGRAPHY.subheading, color: C.text }}>Ders Bazli</Text>
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: C.border,
          padding: SPACING.lg,
          gap: SPACING.md,
        }}
      >
        {bars.map((b, i) => (
          <Bar
            key={b.name}
            name={b.name}
            color={b.color}
            net={b.net}
            max={b.max}
            delay={i * 120}
            onPress={() => onBarPress?.(b)}
          />
        ))}
      </View>
    </View>
  );
}
