import { View } from "react-native";

export function useAnimPress(scaleTo = 0.96) {
  const onPressIn = () => {};
  const onPressOut = () => {};
  const animStyle = {};

  return { animStyle, onPressIn, onPressOut, AnimatedView: View };
}
