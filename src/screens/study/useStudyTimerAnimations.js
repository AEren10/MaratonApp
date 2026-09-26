import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);

export function useStudyTimerAnimations(running) {
  const focusProgress = useSharedValue(0);

  useEffect(() => {
    focusProgress.value = withTiming(running ? 1 : 0, { duration: 320, easing: EASE_OUT });
  }, [running, focusProgress]);

  const timerAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(focusProgress.value, [0, 1], [1.0, 1.22]) },
      { translateY: interpolate(focusProgress.value, [0, 1], [0, 36]) },
    ],
  }));

  const topAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
    transform: [{ translateY: interpolate(focusProgress.value, [0, 1], [0, -18]) }],
  }));

  const bottomCardsAnimStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
    transform: [{ translateY: interpolate(focusProgress.value, [0, 1], [0, 22]) }],
  }));

  return {
    focusProgress,
    timerAnimStyle,
    topAnimStyle,
    bottomCardsAnimStyle,
  };
}
