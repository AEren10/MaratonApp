import { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { C } from "../../themes/tokens";

export function XPToast({ amount, visible, onDone }) {
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);

  useEffect(() => {
    if (!visible) return;

    translateY.value = 60;
    opacity.value = 0;
    scale.value = 0.7;

    translateY.value = withSpring(-20, { damping: 12, stiffness: 200 });

    opacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1500, withTiming(0, { duration: 400 }, () => {
        if (onDone) runOnJS(onDone)();
      }))
    );

    scale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 14 })
    );
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[s.container, animStyle]} pointerEvents="none">
      <Text style={s.icon}>⚡</Text>
      <Text style={s.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: C.amber + "EE",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    left: 0,
    right: 0,
  },
  icon: { fontSize: 18, textAlign: "center" },
  text: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    color: C.bg,
    letterSpacing: -0.3,
  },
});
