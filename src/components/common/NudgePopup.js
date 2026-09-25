import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../design";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import * as haptic from "../../lib/haptics";
import { Press } from "../../components/design/Press";

const POPUP_COLORS = {
  red: (C) => ({ bg: C.red, icon: C.red }),
  amber: (C) => ({ bg: C.amber, icon: C.amber }),
  green: (C) => ({ bg: C.green, icon: C.green }),
  blue: (C) => ({ bg: C.blue, icon: C.blue }),
  purple: (C) => ({ bg: C.purple, icon: C.purple }),
  coral: (C) => ({ bg: C.accent, icon: C.accent }),
};

const AUTO_DISMISS_MS = 4500;

export function NudgePopup({ nudge, visible, onDismiss, onAction }) {
  const C = useC();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(120);
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
      withTiming(120, { duration: 350 }, () => {
        opacity.value = withTiming(0, { duration: 200 });
        if (onDismiss) scheduleOnRN(onDismiss);
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
    translateY.value = withTiming(120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (onAction) scheduleOnRN(onAction, nudge);
    });
  };

  const handleDismiss = () => {
    translateY.value = withTiming(120, { duration: 250 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (onDismiss) scheduleOnRN(onDismiss);
    });
  };

  return (
    <Animated.View style={[styles.container, { bottom: insets.bottom + STEP.s4 }, animStyle]}>
      <Press haptic="none" onPress={handlePress} style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.bg + "20" }]}>
          <Icon name={nudge.icon || "bell"} size={20} color={colors.icon} />
        </View>
        <View style={styles.body}>
          <Text style={[styles.message, { color: C.text }]}>{nudge.message}</Text>
          {nudge.actionLabel && (
            <Text style={[styles.action, { color: colors.icon }]}>{nudge.actionLabel.toUpperCase()}</Text>
          )}
        </View>
        <Press haptic="none" onPress={handleDismiss} hitSlop={12} style={styles.close}>
          <Icon name="x" size={16} color={C.text3} />
        </Press>
      </Press>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: GUTTER,
    right: GUTTER,
    zIndex: 10000,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: SHAPE.card,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: SHAPE.badge,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: STEP.s2,
  },
  body: { flex: 1, paddingHorizontal: STEP.s2, paddingVertical: STEP.s3 },
  message: {
    fontFamily: "Archivo_600",
    fontSize: 13,
    lineHeight: 18,
  },
  action: {
    fontFamily: "Archivo_700",
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  close: {
    padding: STEP.s2,
    marginRight: 4,
  },
});
