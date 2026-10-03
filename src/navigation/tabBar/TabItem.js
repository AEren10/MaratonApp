import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { ANIMATION, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Sekme dugmesi. Gunde onlarca kez basilir: geri bildirim kisa ve sakin
// (yay yok, sallanma yok). Secim artik arkadaki kayan hapta (TabIndicator);
// eski alt nokta kalkti.
const PRESS = { duration: 120, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export function TabItem({ tab, active, onPress, onLongPress, C }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const press = (v) => { if (!reduced) scale.set(withTiming(v, PRESS)); };
  const tone = active ? C.text : C.text3;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityHint={tab.hint}
      accessibilityState={{ selected: active }}
      onPressIn={() => press(0.9)}
      onPressOut={() => press(1)}
      onPress={() => { H.select(); onPress(); }}
      onLongPress={onLongPress}
      pressRetentionOffset={12}
      style={s.item}
    >
      <Animated.View style={iconStyle}>
        <Icon name={tab.icon} size={21} color={tone} sw={active ? 2.1 : 1.7} />
      </Animated.View>
      <Text numberOfLines={1} style={[TYPOGRAPHY.micro, s.label, { fontFamily: active ? "Archivo_600" : "Archivo_500", color: tone }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, minHeight: 56 },
  label: { fontSize: 11 },
});
