import { useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as haptic from "../../../lib/haptics";

function RoundAction({ item, onPress, C }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint={`${item.label} ekranına gider`}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={() => { haptic.tap(); onPress(item); }}
      style={s.item}
    >
      <Animated.View style={[s.circle, { backgroundColor: (item.color || C.accent) + "20", borderColor: (item.color || C.accent) + "50" }, style]}>
        <Icon name={item.icon} size={22} color={item.color || C.accent} sw={2.2} />
      </Animated.View>
      <Text style={[s.label, { color: C.sec }]} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
}

export function RoundActions({ items, secondaryItems, onPress }) {
  const C = useC();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    haptic.tap();
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View>
      <Animated.View entering={FadeInDown.delay(160).duration(440).springify().damping(16)} style={s.grid}>
        {items.map((item) => (
          <RoundAction key={item.label} item={item} onPress={onPress} C={C} />
        ))}
      </Animated.View>

      {expanded && secondaryItems?.length > 0 && (
        <Animated.View entering={FadeInDown.duration(300).springify().damping(16)} style={[s.grid, { marginTop: 16 }]}>
          {secondaryItems.map((item) => (
            <RoundAction key={item.label} item={item} onPress={onPress} C={C} />
          ))}
        </Animated.View>
      )}

      {secondaryItems?.length > 0 && (
        <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={expanded ? "Daralt" : "Tümünü Gör"} accessibilityHint="Hızlı işlem seçeneklerini genişletir veya daraltır" style={[s.toggleBtn, { borderColor: C.border }]}>
          <Text style={[s.toggleText, { color: C.sec }]}>
            {expanded ? "Daralt" : "Tümünü Gör"}
          </Text>
          <Icon name={expanded ? "arrowUp" : "arrowDown"} size={14} color={C.sec} />
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  item: { alignItems: "center", width: "25%", gap: 8 },
  circle: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  label: { ...TYPOGRAPHY.captionMedium, fontSize: 11 },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleText: { ...TYPOGRAPHY.captionMedium, fontSize: 12 },
});
