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
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../design";

const SHOW_MS = 300;
const VISIBLE_MS = 2500;
const HIDE_MS = 250;

export function XPBoostToast({ visible, amount, multiplier = 1, onDismiss }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    translateY.value = 60;
    opacity.value = 0;

    const handleDismiss = () => {
      onDismiss?.();
    };

    translateY.value = withSequence(
      withTiming(0, { duration: SHOW_MS }),
      withDelay(VISIBLE_MS, withTiming(60, { duration: HIDE_MS })),
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

  return (
    <Animated.View style={[styles.container, { bottom: insets.bottom + STEP.s4 + 80 }, animStyle]} pointerEvents="none">
      <View style={[styles.card, { backgroundColor: C.surface, borderColor: boosted ? C.amber : C.accent }]}>
        <Icon
          name={boosted ? "zap" : "star"}
          size={18}
          color={boosted ? C.amber : C.accent}
        />
        <Text style={[styles.amount, { color: C.text }]}>+{amount} XP</Text>
        {boosted && (
          <View style={[styles.pill, { backgroundColor: C.amber + "30" }]}>
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
    paddingHorizontal: STEP.s3,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  amount: {
    fontFamily: "Archivo_700",
    fontSize: 15,
    marginLeft: STEP.s1,
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: SHAPE.pill,
    marginLeft: STEP.s2,
  },
  pillText: {
    fontFamily: "Archivo_700",
    fontSize: 11,
  },
});
