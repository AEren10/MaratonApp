import Animated from "react-native-reanimated";
import { AnimatedPressable } from "./AnimatedPressable";

export function AnimatedCard({ children, onPress, delay = 0, style, disabled }) {

  if (!onPress) {
    return (
      <Animated.View style={style}>
        {children}
      </Animated.View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      style={style}
    >
      {children}
    </AnimatedPressable>
  );
}
