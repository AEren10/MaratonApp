import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import * as haptic from "../../lib/haptics";

const POPUP_COLORS = {
  red: (C) => ({ bg: C.red, icon: C.red }),
  amber: (C) => ({ bg: C.amber, icon: C.amber }),
  green: (C) => ({ bg: C.green, icon: C.green }),
  blue: (C) => ({ bg: C.blue, icon: C.blue }),
  purple: (C) => ({ bg: C.purple, icon: C.purple }),
  coral: (C) => ({ bg: C.coral, icon: C.coral }),
};

const AUTO_DISMISS_MS = 4500;

export function NudgePopup({ nudge, visible, onDismiss, onAction }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-120);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    if (!visible || !nudge) return;

    haptic.tap();
    translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 250 });
    scale.value = withSpring(1, { damping: 16, stiffness: 260 });

    translateY.value = withDelay(
      AUTO_DISMISS_MS,
      withTiming(-120, { duration: 350 }, () => {
        opacity.value = withTiming(0, { duration: 200 });
        if (onDismiss) runOnJS(onDismiss)();
      }),
    );
  }, [visible, nudge]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible || !nudge) return null;

  const colors = (POPUP_COLORS[nudge.color] || POPUP_COLORS.amber)(C);

  const handlePress = () => {
    haptic.tap();
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (onAction) runOnJS(onAction)(nudge);
    });
  };

  const handleDismiss = () => {
    translateY.value = withTiming(-120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (onDismiss) runOnJS(onDismiss)();
    });
  };

  return (
    <Animated.View
      style={[s.wrap, { top: insets.top + 8 }, animStyle]}
      pointerEvents="box-none"
    >
      <Pressable onPress={handlePress} style={[s.card, { backgroundColor: C.surface, borderColor: colors.bg + "50" }]}>
        <View style={[s.iconBox, { backgroundColor: colors.bg + "30" }]}>
          <Icon name={nudge.icon || "bell"} size={18} color={colors.bg} />
        </View>
        <View style={s.body}>
          <Text style={[s.message, { color: C.text }]} numberOfLines={1}>
            {nudge.message}
          </Text>
          {nudge.actionLabel ? (
            <Text style={[s.action, { color: colors.bg }]}>{nudge.actionLabel} →</Text>
          ) : null}
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12} style={s.close}>
          <Icon name="x" size={14} color={C.muted} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10000,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.md,
  },
  body: { flex: 1, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md },
  message: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    marginTop: 2,
  },
  close: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },
});
