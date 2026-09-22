import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  cancelAnimation,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP, SHAPE } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../design";

const SHOW_MS = 280;
const VISIBLE_MS = 2000;
const HIDE_MS = 220;

export function XPBoostToast({ visible, amount, multiplier = 1, onDismiss }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    translateY.value = -50;
    opacity.value = 0;

    const handleDismiss = () => {
      onDismiss?.();
    };

    translateY.value = withSequence(
      withTiming(0, { duration: SHOW_MS, easing: Easing.out(Easing.cubic) }),
      withDelay(VISIBLE_MS, withTiming(-50, { duration: HIDE_MS, easing: Easing.in(Easing.cubic) })),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: SHOW_MS }),
      withDelay(VISIBLE_MS, withTiming(0, { duration: HIDE_MS }, () => {
        runOnJS(handleDismiss)();
      })),
    );
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [visible, onDismiss, translateY, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const boosted = multiplier > 1;
  const topInset = Math.max(insets.top, 12);

  return (
    <Animated.View style={[styles.container, { top: topInset + 6 }, animStyle]} pointerEvents="none">
      <View style={[styles.card, { backgroundColor: C.elev, borderColor: boosted ? C.amber : C.border }]}>
        <Icon
          name={boosted ? "zap" : "star"}
          size={15}
          color={boosted ? C.amber : C.accentBright}
        />
        <Text style={[styles.amount, { color: C.text }]}>+{amount} XP</Text>
        {boosted && (
          <View style={[styles.pill, { backgroundColor: C.amber + "25" }]}>
            <Text style={[styles.pillText, { color: C.amber }]}>x{multiplier}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10001,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  amount: {
    fontFamily: "Archivo_700",
    fontSize: 13.5,
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SHAPE.pill,
    marginLeft: 8,
  },
  pillText: {
    fontFamily: "Archivo_700",
    fontSize: 11,
  },
});
