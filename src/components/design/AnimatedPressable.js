import { Pressable } from "react-native";
import Animated from "react-native-reanimated";
import { usePressScale } from "./usePressScale";
import * as H from "../../lib/haptics";

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const press = usePressScale(scaleValue);

  const pressable = (
    <ReanimatedPressable
      onPress={(e) => {
        if (haptic && HAPTIC_FN[haptic]) HAPTIC_FN[haptic]();
        onPress?.(e);
      }}
      onPressIn={(e) => {
        press.onIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        press.onOut();
        onPressOut?.(e);
      }}
      disabled={disabled}
      style={[press.style, style]}
      {...rest}
    >
      {children}
    </ReanimatedPressable>
  );

  if (entering || exiting) {
    return (
      <Animated.View entering={entering} exiting={exiting}>
        {pressable}
      </Animated.View>
    );
  }

  return pressable;
}
