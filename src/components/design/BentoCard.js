import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { C } from "../../themes/tokens";

const AnimPressable = Animated.createAnimatedComponent(Pressable);

export function BentoCard({
  children,
  onPress,
  pad = 16,
  accent,
  gradient,
  border,
  style,
  ...rest
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const inner = (
    <View
      style={[
        {
          backgroundColor: gradient ? "transparent" : C.surface,
          borderRadius: 24,
          padding: pad,
          borderWidth: 1,
          borderColor: border ?? C.border,
          overflow: "hidden",
          position: "relative",
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  const wrapped = gradient ? (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24 }}
    >
      {inner}
    </LinearGradient>
  ) : (
    inner
  );

  if (!onPress) return wrapped;

  return (
    <AnimPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 18, stiffness: 320 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 320 }); }}
      style={pressStyle}
    >
      {wrapped}
    </AnimPressable>
  );
}
