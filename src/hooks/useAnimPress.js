import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

export function useAnimPress(scaleTo = 0.97) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
  };

  return { animStyle, onPressIn, onPressOut, AnimatedView: Animated.View };
}
