import { View, Pressable } from "react-native";

export function AnimatedCard({ children, onPress, delay = 0, style, disabled }) {
  if (!onPress) {
    return <View style={style}>{children}</View>;
  }

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      <View style={style}>{children}</View>
    </Pressable>
  );
}
