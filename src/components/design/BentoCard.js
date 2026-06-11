import { Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "../../themes/tokens";

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
      {accent ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: accent,
            opacity: 0.6,
          }}
        />
      ) : null}
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
  return <Pressable onPress={onPress}>{wrapped}</Pressable>;
}
