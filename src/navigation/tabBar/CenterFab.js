import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { Icon } from "../../components/design";
import { ANIMATION } from "../../themes/tokens";
import * as H from "../../lib/haptics";

// Ortadaki + . Basinca sakin kuculur; panel ACIKKEN artiya 45 derece donup
// carpi olur (durum: "bu dugme simdi kapatir"), panel kapaninca geri doner.
// Eskiden basili tutarken donup birakinca geri donuyordu -- anlamsiz hareket.
const EASE_OUT = Easing.bezier(...ANIMATION.easing.easeOut);
const EASE_IN_OUT = Easing.bezier(...ANIMATION.easing.easeInOut);

export function CenterFab({ open, onPress, C }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const turn = useSharedValue(open ? 1 : 0);

  useEffect(() => {
    turn.set(reduced ? (open ? 1 : 0) : withTiming(open ? 1 : 0, { duration: 220, easing: EASE_IN_OUT }));
  }, [open, reduced, turn]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { rotate: `${turn.get() * 45}deg` }],
  }));
  const press = (v) => { if (!reduced) scale.set(withTiming(v, { duration: 120, easing: EASE_OUT })); };

  return (
    <View style={s.slot}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? "Hızlı işlem menüsünü kapat" : "Yeni kayıt ekle"}
        accessibilityHint="Hızlı işlem menüsünü açar"
        onPressIn={() => press(0.94)}
        onPressOut={() => press(1)}
        onPress={() => { H.tap(); onPress(); }}
        pressRetentionOffset={12}
      >
        {/* Kirmizi isilti (kullanici karari, 28 Eylul): eski + dugmesinin en sevilen yani. */}
        <Animated.View style={[s.fab, { backgroundColor: C.accent, shadowColor: C.accent }, fabStyle]}>
          <Icon name="plus" size={24} color={C.textOnFill} sw={3} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  slot: { flex: 1, alignItems: "center" },
  fab: {
    width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", marginTop: -18,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.32, shadowRadius: 14, elevation: 8,
  },
});
