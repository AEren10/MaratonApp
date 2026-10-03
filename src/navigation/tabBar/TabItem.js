import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { ANIMATION, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Sekme dugmesi. Parmak degince (birakmadan) sekmenin arkasinda hafif bir
// zemin belirir ve ikon biraz kuculur: "basiyorum" hissi. Secim arkadaki
// kayan hapta (TabIndicator).
const PRESS = { duration: 120, easing: Easing.bezier(...ANIMATION.easing.easeOut) };
const RELEASE = { duration: 220, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export function TabItem({ tab, active, onPress, onPressIn, onLongPress, C }) {
  const reduced = useReducedMotion();
  const p = useSharedValue(0);
  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - p.get() * 0.1 }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: p.get() }));
  const press = (v) => { if (!reduced) p.set(withTiming(v, v ? PRESS : RELEASE)); };
  // Secili sekme kirmizi: hangi sayfadaysan onun ikonu ve adi.
  const tone = active ? C.accentBright : C.text3;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityHint={tab.hint}
      accessibilityState={{ selected: active }}
      onPressIn={() => { press(1); onPressIn?.(); }}
      onPressOut={() => press(0)}
      onPress={() => { H.select(); onPress(); }}
      onLongPress={onLongPress}
      pressRetentionOffset={12}
      style={s.item}
    >
      {!active ? <Animated.View pointerEvents="none" style={[s.glow, { backgroundColor: C.void }, glowStyle]} /> : null}
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
  glow: { position: "absolute", top: 4, bottom: 4, left: 4, right: 4, borderRadius: 22 },
  label: { fontSize: 11 },
});
