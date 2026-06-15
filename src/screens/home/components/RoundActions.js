import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
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
      <Animated.View style={[s.circle, { backgroundColor: item.c }, style]}>
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
    <View style={s.row}>
      {items.map((item) => (
        <RoundAction key={item.label} item={item} onPress={onPress} C={C} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { alignItems: "center", flex: 1, gap: 8 },
  circle: {
    width: 64, height: 64, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#1B1530", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 14, elevation: 4,
  },
  label: { ...TYPOGRAPHY.captionMedium, fontSize: 11 },
});
