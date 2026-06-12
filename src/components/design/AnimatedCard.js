import { Pressable } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedCard({ children, onPress, delay = 0, style, disabled }) {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const entering = FadeInDown.delay(delay).duration(420).springify().damping(20).mass(0.6);

  if (!onPress) {
    return (
      <Animated.View entering={entering} style={style}>
        {children}
      </Animated.View>
    );
  }

  return (
    <AnimPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 18, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); }}
      entering={entering}
      style={[style, pressStyle]}
    >
      {children}
    </AnimPressable>
  );
}
