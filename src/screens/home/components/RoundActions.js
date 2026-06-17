import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as haptic from "../../../lib/haptics";

function RoundAction({ item, onPress, C }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 12 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12 }); }}
      onPress={() => { haptic.tap(); onPress(item); }}
      style={s.item}
    >
      <Animated.View style={[s.circle, { backgroundColor: item.c, shadowColor: item.c }, style]}>
        <Icon name={item.icon} size={24} color="#FFFFFF" sw={2.2} />
      </Animated.View>
      <Text style={[s.label, { color: C.sec }]} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
}

// Büyük, solid renkli, birbirinden farklı hızlı aksiyonlar.
export function RoundActions({ items, onPress }) {
  const C = useC();
  return (
    <Animated.View entering={FadeInDown.delay(160).duration(440).springify().damping(16)} style={s.grid}>
      {items.map((item) => (
        <RoundAction key={item.label} item={item} onPress={onPress} C={C} />
      ))}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 16 },
  item: { alignItems: "center", width: "25%", gap: 8 },
  circle: {
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.38, shadowRadius: 12, elevation: 5,
  },
  label: { ...TYPOGRAPHY.captionMedium, fontSize: 10 },
});
