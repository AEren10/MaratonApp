import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { ANIMATION, TYPOGRAPHY } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Sekme dugmesi. Gunde onlarca kez basilir: geri bildirim kisa ve sakin
// (yay yok, sallanma yok). Secim noktasi HEP yerinde durur, yalniz belirir;
// eskiden secili sekmede nokta yer kapliyordu ve etiket 3px zipliyordu.
const EASE_OUT = Easing.bezier(...ANIMATION.easing.easeOut);
const PRESS = { duration: 120, easing: EASE_OUT };
const DOT = { duration: 180, easing: EASE_OUT };

export function TabItem({ tab, active, onPress, C }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const dot = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    dot.set(reduced ? (active ? 1 : 0) : withTiming(active ? 1 : 0, DOT));
  }, [active, reduced, dot]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dot.get(),
    transform: [{ scale: 0.4 + dot.get() * 0.6 }],
  }));
  const press = (v) => { if (!reduced) scale.set(withTiming(v, PRESS)); };

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityHint={tab.hint}
      accessibilityState={{ selected: active }}
      onPressIn={() => press(0.92)}
      onPressOut={() => press(1)}
      onPress={() => { H.select(); onPress(); }}
      pressRetentionOffset={12}
      style={s.item}
    >
      <Animated.View style={[s.icon, iconStyle]}>
        <Icon name={tab.icon} size={22} color={active ? C.text : C.muted} sw={active ? 2.2 : 1.8} />
      </Animated.View>
      <Animated.View style={[s.dot, { backgroundColor: C.accent }, dotStyle]} />
      <Text style={[TYPOGRAPHY.micro, { fontFamily: active ? "Archivo_600" : "Archivo_500", color: active ? C.text : C.muted }]}>
        {tab.label}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  item: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6, minHeight: 48 },
  icon: { alignItems: "center" },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3, marginBottom: 1 },
});
