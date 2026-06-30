import { useEffect, useMemo } from "react";
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
import { useC } from "../../contexts/ThemeContext";
import * as H from "../../lib/haptics";

export function XPToast({ amount, visible, onDone }) {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;

    H.tap();

    translateY.value = 80;
    opacity.value = 0;
    scale.value = 0.5;
    rotate.value = 0;

    translateY.value = withSpring(-24, { damping: 10, stiffness: 180, mass: 0.8 });

    opacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(1600, withTiming(0, { duration: 400 }, () => {
        if (onDone) runOnJS(onDone)();
      }))
    );

    scale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 280 }),
      withSpring(1, { damping: 14, stiffness: 200 })
    );

    rotate.value = withSequence(
      withTiming(-3, { duration: 100 }),
      withSpring(0, { damping: 8, stiffness: 200 })
    );
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
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

function makeStyles(C) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 120,
      alignSelf: "center",
      backgroundColor: C.accent + "EE",
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      shadowColor: C.accent,
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
      color: C.textOnFill,
      letterSpacing: -0.3,
    },
  });
}
