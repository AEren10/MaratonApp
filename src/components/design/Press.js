import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ANIMATION } from "../../themes/tokens";
import * as H from "../../lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE_OUT = Easing.bezier(...ANIMATION.easing.easeOut);
const { scale: PRESS_SCALE, duration: PRESS_MS } = ANIMATION.press;
export const PRESS_ROW = ANIMATION.press.row;

// Parmak birkac piksel kayinca basma iptal olmasin.
const RETENTION = { top: 12, bottom: 12, left: 12, right: 12 };

const HAPTIC = { tap: H.tap, select: H.select, medium: H.medium, none: null };

/**
 * Basilabilir her yuzeyin ortak geri bildirimi: 130ms'lik olcek.
 * Kart, satir, cip, ikon -- Button disindaki her sey bunu kullanir.
 */
export function Press({
  children,
  onPress,
  onLongPress,
  disabled,
  haptic = "tap",
  scaleTo = PRESS_SCALE,
  style,
  hitSlop,
  accessibilityRole = "button",
  ...rest
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const to = (v) => {
    if (reduced) return;
    scale.set(withTiming(v, { duration: PRESS_MS, easing: EASE_OUT }));
  };

  const fire = HAPTIC[haptic];

  return (
    <AnimatedPressable
      onPressIn={() => to(scaleTo)}
      onPressOut={() => to(1)}
      onPress={(e) => {
        if (disabled) return;
        fire?.();
        onPress?.(e);
      }}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={hitSlop}
      pressRetentionOffset={RETENTION}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: !!disabled }}
      style={[animStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
