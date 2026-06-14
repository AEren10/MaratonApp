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
      <Animated.View style={[s.circle, { backgroundColor: item.c + "26" }, style]}>
        <Icon name={item.icon} size={22} color={item.c} />
      </Animated.View>
      <Text style={s.label} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
}

// Halo altı yuvarlak renkli hızlı aksiyonlar.
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
  item: { alignItems: "center", flex: 1, gap: 6 },
  circle: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  label: { ...TYPOGRAPHY.micro, color: C.sec, fontSize: 10 },
});
