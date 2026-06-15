import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Icon } from "../../../components/design";
import { C, TYPOGRAPHY } from "../../../themes/tokens";
import * as haptic from "../../../lib/haptics";

function RoundAction({ item, onPress }) {
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
        <Icon name={item.icon} size={24} color="#13211B" sw={2.2} />
      </Animated.View>
      <Text style={s.label} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
}

// Büyük, solid renkli, birbirinden farklı hızlı aksiyonlar (basınca küçülme + haptic).
export function RoundActions({ items, onPress }) {
  return (
    <View style={s.row}>
      {items.map((item) => (
        <RoundAction key={item.label} item={item} onPress={onPress} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  item: { alignItems: "center", flex: 1, gap: 8 },
  circle: {
    width: 62, height: 62, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  label: { ...TYPOGRAPHY.captionMedium, color: C.sec, fontSize: 11 },
});
