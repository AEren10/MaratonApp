import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../../contexts/ThemeContext";
import { AnimatedPressable } from "./AnimatedPressable";

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
  const C = useC();

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
    <AnimatedPressable onPress={onPress}>
      {wrapped}
    </AnimatedPressable>
  );
}
