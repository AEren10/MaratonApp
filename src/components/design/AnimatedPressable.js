import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as H from "../../lib/haptics";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 320 };

const HAPTIC_FN = {
  tap: H.tap,
  select: H.select,
  medium: H.medium,
  success: H.success,
};

export function AnimatedPressable({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scaleValue = 0.97,
  haptic = "tap",
  disabled,
  style,
  entering,
  exiting,
  ...rest
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <ReanimatedPressable
      onPress={(e) => {
        if (haptic && HAPTIC_FN[haptic]) HAPTIC_FN[haptic]();
        onPress?.(e);
      }}
      onPressIn={(e) => {
        scale.value = withSpring(scaleValue, SPRING);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING);
        onPressOut?.(e);
      }}
      disabled={disabled}
      entering={entering}
      exiting={exiting}
      style={[animStyle, style]}
      {...rest}
    >
      {children}
    </ReanimatedPressable>
  );
}
