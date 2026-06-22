import { useCallback } from "react";
import { useSharedValue, useAnimatedStyle, withDelay, withTiming, Easing } from "react-native-reanimated";
import { useEffect } from "react";

export function useStaggerItem(index, baseDelay = 80) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = index * baseDelay;
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animStyle };
}
