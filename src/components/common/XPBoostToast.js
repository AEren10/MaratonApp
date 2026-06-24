import { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
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
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { Icon } from "../design";

const SHOW_MS = 300;
const VISIBLE_MS = 2500;
const HIDE_MS = 250;

export function XPBoostToast({ visible, amount, multiplier = 1, onDismiss }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C, insets.top), [C, insets.top]);
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!visible) return;
    translateY.value = -60;
    opacity.value = 0;

    translateY.value = withSequence(
      withTiming(0, { duration: SHOW_MS }),
      withDelay(VISIBLE_MS, withTiming(-60, { duration: HIDE_MS })),
    );
    opacity.value = withSequence(
      withTiming(1, { duration: SHOW_MS }),
      withDelay(VISIBLE_MS, withTiming(0, { duration: HIDE_MS }, () => {
        if (dismissRef.current) runOnJS(dismissRef.current)();
      })),
    );
    return () => {
      cancelAnimation(translateY);
      cancelAnimation(opacity);
    };
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const boosted = multiplier > 1;

  return (
    <Animated.View style={[s.container, animStyle]} pointerEvents="none">
      <Icon
        name={boosted ? "zap" : "star"}
        size={18}
        color={boosted ? C.amber : C.accent}
      />
      <Text style={s.amount}>+{amount} XP</Text>
      {boosted && (
        <View style={s.pill}>
          <Text style={s.pillText}>x{multiplier}</Text>
        </View>
      )}
    </Animated.View>
  );
}

function makeStyles(C, safeTop) {
  return StyleSheet.create({
    container: {
      position: "absolute",
      top: safeTop + SPACING.md,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      zIndex: 9999,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    amount: {
      ...TYPOGRAPHY.subheading,
      color: C.text,
    },
    pill: {
      backgroundColor: C.amber,
      borderRadius: RADIUS.pill,
      paddingHorizontal: SPACING.sm,
      paddingVertical: 2,
    },
    pillText: {
      fontFamily: "SpaceGrotesk_700Bold",
      fontSize: 13,
      color: "#000000",
      letterSpacing: -0.3,
    },
  });
}
