import Animated, { FadeInDown } from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";

export function AnimatedCard({ children, onPress, delay = 0, style, disabled }) {
  const entering = FadeInDown.delay(delay).duration(420).springify().damping(20).mass(0.6);

  if (!onPress) {
    return (
      <Animated.View entering={entering} style={style}>
        {children}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      entering={entering}
      style={style}
    >
      {children}
    </AnimatedPressable>
  );
}
