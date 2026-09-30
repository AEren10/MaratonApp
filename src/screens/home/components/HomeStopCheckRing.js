import { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { ANIMATION, CONTROL, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

const RING_SIZE = 22;
// Tik: dolgu merkezden oturur (0.6 -> 1, opaklikla). Gunde onlarca kez ->
// kisa ve sakin; ziplama yok. Imza an (hat cizilir, dugum oturur) ayri.
const FILL = { duration: 160, easing: Easing.bezier(...ANIMATION.easing.easeOut) };

export function HomeStopCheckRing({ done, isNext, onToggle, accessibilityLabel }) {
  const C = useC();
  const reduced = useReducedMotion();
  const fill = useSharedValue(done ? 1 : 0);
  useEffect(() => { fill.set(reduced ? (done ? 1 : 0) : withTiming(done ? 1 : 0, FILL)); }, [done, reduced, fill]);
  const fillStyle = useAnimatedStyle(() => ({
    opacity: fill.get(),
    transform: [{ scale: 0.6 + fill.get() * 0.4 }],
  }));

  const handlePress = useCallback(() => {
    if (done) {
      H.select();
      onToggle();
      return;
    }
    H.success();
    onToggle();
  }, [done, onToggle]);

  return (
    <Press haptic="none" scaleTo={0.92}
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={accessibilityLabel}
      style={[s.area]}
    >
      <View
        style={[
          s.ring,
          {
            borderColor: done ? C.up : (isNext ? C.accent : C.border),
            borderWidth: done ? 0 : (isNext ? 2 : 1.5),
          },
        ]}
      >
        <Animated.View pointerEvents="none" style={[s.fill, { backgroundColor: C.up }, fillStyle]}>
          <Icon name="check" size={11} color={C.bg} sw={2.4} />
        </Animated.View>
      </View>
    </Press>
  );
}

const s = StyleSheet.create({
  area: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
