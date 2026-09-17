import { useState, useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const RING_SIZE = STEP.s3 + 6;

export function HomeStopCheckRing({ done, isNext, onToggle, onChecked, accessibilityLabel }) {
  const C = useC();
  const [checking, setChecking] = useState(false);
  const timeoutRef = useRef(null);
  const ringScale = useSharedValue(1);
  const iconScale = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!checking) {
      iconScale.value = done ? 1 : 0;
    }
  }, [done, checking, iconScale]);

  const handlePress = useCallback(() => {
    if (checking) return;

    if (done) {
      // Geri alma: hizli ve dogrudan
      H.select();
      onToggle();
      return;
    }

    // Tamamlama: yayli mikro-animasyon + ekranda onay bildirimi + puruzsuz gecis gecikmesi
    setChecking(true);
    H.success();
    onChecked?.();

    ringScale.value = withSequence(
      withTiming(0.78, { duration: 80 }),
      withSpring(1.22, { damping: 9, stiffness: 220 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
    iconScale.value = withSpring(1, { damping: 10, stiffness: 200 });

    timeoutRef.current = setTimeout(() => {
      onToggle();
      setChecking(false);
    }, 420);
  }, [done, checking, onToggle, onChecked, ringScale, iconScale]);

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
    opacity: iconScale.value,
  }));

  const isDone = done || checking;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isDone }}
      accessibilityLabel={accessibilityLabel}
      style={s.area}
    >
      <Animated.View
        style={[
          s.ring,
          {
            borderColor: isDone ? C.up : (isNext ? C.accent : C.text5),
            backgroundColor: isDone ? C.up : "transparent",
          },
          ringAnimStyle,
        ]}
      >
        <Animated.View style={iconAnimStyle}>
          <Icon name="check" size={13} color={C.bg} sw={2.8} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  area: {
    width: CONTROL.tapMin,
    height: CONTROL.tapMin,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
